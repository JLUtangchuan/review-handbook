---
title: "高维tensor计算，多用torch.einsum，别再去squeeze，unsqueeze了"
author: "树叶的一生"
source_url: https://zhuanlan.zhihu.com/p/12983923676
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 高维tensor计算，多用torch.einsum，别再去squeeze，unsqueeze了

> 作者: 树叶的一生 | 来源: https://zhuanlan.zhihu.com/p/12983923676

---

最近要用到高维的tensor相乘，发现不同方法实现效率上真的差好多（省流可以直接看实验3）。

最省流：unsqueeze会增加矩阵维度，导致更慢的计算。

本人是新手，欢迎批评指正！

实验1：
输入张量 X 的形状为 [B, channel, d_model] ，B为batch_size，channel为通道数，d_model为特征数
权重张量 W 的形状为 [channel, d_model, out_dim] ，channel为通道数，d_model为矩阵的输入，out_dim为输出维度

我们要将X中每个channel的d_model长的向量分别与W中对应的channel的权重矩阵[d_model,out_dim]相乘，最后得到[B,channel,out_dim]的张量。

方法有三种，

1是直接使用torch.einsum('bcd,cdo->bco', X, W)

2是使用torch.bmm(X.transpose(0,1),W).transpose(0,1)

3是使用(X.unsqueeze(-2) @ W).squeeze(-2)

能实现相同的效果，但是效率差很多，

Einsum: avg = 0.000885s, std = 0.000411s
BMM: avg = 0.000781s, std = 0.000174s
Broadcast Matmul: avg = 0.048058s, std = 0.000667s

结论：多用torch.bmm和torch.einsum，torch.bmm效率最高，少用@和torch.matmul，或者使用torch.matmul要注意一些问题（实验2会讲到）

# 代码来自GPT-o1
# [b,c,d] @ [c,d,o]
import torch
import time
import statistics
B = 64       # batch_size
channel = 128
d_model = 512
out_dim = 256

torch.manual_seed(42)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

X = torch.randn(B, channel, d_model, device=device)
W = torch.randn(channel, d_model, out_dim, device=device)
##################method1#######################
def einsum_method(X, W):
    # Y = torch.einsum('bcd,cdo->bco', X, W)
    return torch.einsum('bcd,cdo->bco', X, W)
##################method2#######################
def bmm_method(X, W):
    # X: [B, channel, d_model], W: [channel, d_model, out_dim]
    X_t = X.transpose(0, 1)  # [channel, B, d_model]
    Y_t = torch.bmm(X_t, W)  # [channel, B, out_dim]
    Y = Y_t.transpose(0, 1)  # [B, channel, out_dim]
    return Y
##################method3#######################
def broadcast_matmul_method(X, W):
    X_unsq = X.unsqueeze(-2)  # [B,V channel, 1, d_model]
    return torch.matmul(X_unsq, W).squeeze(-2)

@torch.no_grad()
def benchmark_method(method_fn, X, W, warmup=10, repeat=50):
    # 预热
    for _ in range(warmup):
        _ = method_fn(X, W)
        torch.cuda.synchronize()  # 确保预热阶段完成

    # 正式计时
    times = []
    for _ in range(repeat):
        torch.cuda.synchronize()  # 确保上一次操作完成
        start = time.perf_counter()  # 高精度计时
        _ = method_fn(X, W)
        torch.cuda.synchronize()  # 确保本次操作完成
        end = time.perf_counter()
        times.append(end - start)

    avg_time = statistics.mean(times)
    std_time = statistics.pstdev(times)  # 全部样本的标准偏差
    return avg_time, std_time

# Einsum
einsum_avg, einsum_std = benchmark_method(einsum_method, X, W)
print(f"Einsum: avg = {einsum_avg:.6f}s, std = {einsum_std:.6f}s")

# BMM
bmm_avg, bmm_std = benchmark_method(bmm_method, X, W)
print(f"BMM: avg = {bmm_avg:.6f}s, std = {bmm_std:.6f}s")

# Broadcast Matmul
broadcast_avg, broadcast_std = benchmark_method(broadcast_matmul_method, X, W)
print(f"Broadcast Matmul: avg = {broadcast_avg:.6f}s, std = {broadcast_std:.6f}s")




实验2：

输入张量 X ：[channel, B, d_model]（与实验1的X:[B, channel, d_model]的区别在于先进行了转置，方便后两维度直接相乘）

权重W：[channel, d_model, out_dim]

目标：我们直接计算X与W相乘，得到[channel, B, out_dim]

与实验1不同，这里不涉及维度转换的问题，可以直接使用bmm，或者@和matmul，结果如下：

Einsum: avg = 0.000789s, std = 0.000149s
BMM: avg = 0.000772s, std = 0.000180s
Broadcast Matmul: avg = 0.000791s, std = 0.000214s

结论：发现此时@（即，matmul）效率最高，但是三个都差不多，这说明在不需要维度转换的时候，其实效率是很高的。结合之前torch.bmm使用了转置，我们可以知道，其实转置应该花不了多少时间，所以问题可能就处在了squeeze和unsqueeze上，也许是因为使用了unsqueeze操作，增加了矩阵的维度，然后@（matmul）进行了超高维度的矩阵运算（原来是3维，使用unsqueeze变到了4维），大大增加了计算量。

# [c,b,d] @ [c,d,o]
B = 64       # batch_size
channel = 128
d_model = 512
out_dim = 256
import torch
import time
import statistics

torch.manual_seed(42)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

X = torch.randn(channel,B, d_model, device=device)
W = torch.randn(channel, d_model, out_dim, device=device)
################method1#####################
def einsum_method(X, W):
    return torch.einsum('cbd,cdo->cbo', X, W)
################method2#####################
def bmm_method(X, W):
    return torch.bmm(X, W)  # [channel, B, out_dim]
################method3#####################
def broadcast_matmul_method(X, W):
    return torch.matmul(X, W)


@torch.no_grad()
def benchmark_method(method_fn, X, W, warmup=10, repeat=50):
    # 预热
    for _ in range(warmup):
        _ = method_fn(X, W)
    torch.cuda.synchronize()

    # 正式计时
    times = []
    for _ in range(repeat):
        start = time.time()
        _ = method_fn(X, W)
        torch.cuda.synchronize()  # 确保所有GPU计算完成
        end = time.time()
        times.append(end - start)

    avg_time = statistics.mean(times)
    std_time = statistics.pstdev(times)  # 全部样本的标准偏差
    return avg_time, std_time
# Einsum
einsum_avg, einsum_std = benchmark_method(einsum_method, X, W)
print(f"Einsum: avg = {einsum_avg:.6f}s, std = {einsum_std:.6f}s")

# 清理显存
torch.cuda.empty_cache()

# BMM
bmm_avg, bmm_std = benchmark_method(bmm_method, X, W)
print(f"BMM: avg = {bmm_avg:.6f}s, std = {bmm_std:.6f}s")

# 清理显存
torch.cuda.empty_cache()

# Broadcast Matmul
broadcast_avg, broadcast_std = benchmark_method(broadcast_matmul_method, X, W)
print(f"Broadcast Matmul: avg = {broadcast_avg:.6f}s, std = {broadcast_std:.6f}s")


实验3

为了验证实验2中的猜想，我们在实验1中增加了一个新的matmul方法

即，把实验1中的方法3，从(X.unsqueeze(-2) @ W).squeeze(-2)变为(X.transpose(0,1) @ W).transpose(0,1)

方法1：使用torch.einsum('bcd,cdo->bco', X, W)

方法2：使用torch.bmm(X.transpose(0,1),W).transpose(0,1)

方法3：使用(X.unsqueeze(-2) @ W).squeeze(-2)

方法4：使用(X.transpose(0,1) @ W).transpose(0,1)

结果：果发现新的matmul和方法1和方法2效率差不多了，远超于基于unsqueeze的方法3。

Einsum: avg = 0.000821s, std = 0.000221s
BMM: avg = 0.000758s, std = 0.000206s
Broadcast Matmul method1: avg = 0.048457s, std = 0.001559s
Broadcast Matmul method2: avg = 0.000705s, std = 0.000173s

结论：

验证了实验2中的猜想，即，unsqueeze增加了矩阵维度，增加了计算量。

代码如下：

# [b,c,d] @ [c,d,o]
import torch
import time
import statistics
B = 64       # batch_size
channel = 128
d_model = 512
out_dim = 256

torch.manual_seed(42)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

X = torch.randn(B, channel, d_model, device=device)
W = torch.randn(channel, d_model, out_dim, device=device)
##################method1#######################
def einsum_method(X, W):
    # Y = torch.einsum('bcd,cdo->bco', X, W)
    return torch.einsum('bcd,cdo->bco', X, W)
##################method2#######################
def bmm_method(X, W):
    # X: [B, channel, d_model], W: [channel, d_model, out_dim]
    X_t = X.transpose(0, 1)  # [channel, B, d_model]
    Y_t = torch.bmm(X_t, W)  # [channel, B, out_dim]
    Y = Y_t.transpose(0, 1)  # [B, channel, out_dim]
    return Y
##################method3#######################
def broadcast_matmul_method1(X, W):
    X_unsq = X.unsqueeze(-2)  # [B,V channel, 1, d_model]
    return torch.matmul(X_unsq, W).squeeze(-2)
##################method4#######################
def broadcast_matmul_method2(X, W):
    return torch.matmul(X.transpose(0,1), W).transpose(0,1)


@torch.no_grad()
def benchmark_method(method_fn, X, W, warmup=10, repeat=50):
    # 预热
    for _ in range(warmup):
        _ = method_fn(X, W)
        torch.cuda.synchronize()  # 确保预热阶段完成

    # 正式计时
    times = []
    for _ in range(repeat):
        torch.cuda.synchronize()  # 确保上一次操作完成
        start = time.perf_counter()  # 高精度计时
        _ = method_fn(X, W)
        torch.cuda.synchronize()  # 确保本次操作完成
        end = time.perf_counter()
        times.append(end - start)

    avg_time = statistics.mean(times)
    std_time = statistics.pstdev(times)  # 全部样本的标准偏差
    return avg_time, std_time

# Einsum
einsum_avg, einsum_std = benchmark_method(einsum_method, X, W)
print(f"Einsum: avg = {einsum_avg:.6f}s, std = {einsum_std:.6f}s")

# BMM
bmm_avg, bmm_std = benchmark_method(bmm_method, X, W)
print(f"BMM: avg = {bmm_avg:.6f}s, std = {bmm_std:.6f}s")

# Broadcast Matmul
broadcast_avg, broadcast_std = benchmark_method(broadcast_matmul_method1, X, W)
print(f"Broadcast Matmul method1: avg = {broadcast_avg:.6f}s, std = {broadcast_std:.6f}s")

# Broadcast Matmul
broadcast_avg, broadcast_std = benchmark_method(broadcast_matmul_method2, X, W)
print(f"Broadcast Matmul method2: avg = {broadcast_avg:.6f}s, std = {broadcast_std:.6f}s")

实验4（实验3的补充）
输入张量 X 的形状为 [B, V, channel, d_model]
权重张量 W 的形状为 [channel, d_model, out_dim]
目标：得到[B, V, channel, out_dim]

方法1：使用return torch.einsum('bvcd,cdo->bvco', X, W)

方法2：使用X.reshape(B*V, channel, d_model).transpose(0, 1) + torch.bmm

方法3：使用(X.unsqueeze(-2) @ W).squeeze(-2)

方法4：使用X.reshape(B*V, channel, d_model).transpose(0, 1) + torch.matmul

结果：果发现新的matmul和方法1和方法2效率差不多了，远超于基于unsqueeze的方法3。

Einsum: avg = 0.000860s, std = 0.000206s
BMM: avg = 0.000823s, std = 0.000190s
Broadcast Matmul1: avg = 0.096176s, std = 0.001028s
Broadcast Matmul2: avg = 0.000788s, std = 0.000170s


结论：验证了实验2中的猜想，即，unsqueeze增加了矩阵维度，增加了计算量。

# [b,v,c,d] @ [c,d,o]
import torch
import time
import statistics
B = 64       # batch_size
V = 2
channel = 128
d_model = 512
out_dim = 256


torch.manual_seed(42)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

X = torch.randn(B,V, channel, d_model, device=device)
W = torch.randn(channel, d_model, out_dim, device=device)
def einsum_method(X, W):
    return torch.einsum('bvcd,cdo->bvco', X, W)
def bmm_method(X, W):
    # X: [B, V,channel, d_model], W: [channel, d_model, out_dim]
    X_t = X.reshape(B*V, channel, d_model).transpose(0, 1)  # [channel,B*V, d_model]
    Y_t = torch.bmm(X_t, W).transpose(0, 1)  # [channel,B*V, out_dim]
    Y = Y_t.reshape(B, V, channel,out_dim)  # [B, V, channel, out_dim]
    return Y
def broadcast_matmul_method1(X, W):
    X_unsq = X.unsqueeze(-2)  # [B,V channel, 1, d_model]
    return torch.matmul(X_unsq, W).squeeze(-2)
def broadcast_matmul_method2(X, W):
    X_t = X.reshape(B*V, channel, d_model).transpose(0, 1)
    return torch.matmul(X_t, W).reshape(B, V, channel, out_dim).transpose(0, 1)

@torch.no_grad()
def benchmark_method(method_fn, X, W, warmup=10, repeat=50):
    # 预热
    for _ in range(warmup):
        _ = method_fn(X, W)
    torch.cuda.synchronize()

    # 正式计时
    times = []
    for _ in range(repeat):
        start = time.time()
        _ = method_fn(X, W)
        torch.cuda.synchronize()  # 确保所有GPU计算完成
        end = time.time()
        times.append(end - start)

    avg_time = statistics.mean(times)
    std_time = statistics.pstdev(times)  # 全部样本的标准偏差
    return avg_time, std_time
# Einsum
einsum_avg, einsum_std = benchmark_method(einsum_method, X, W)
print(f"Einsum: avg = {einsum_avg:.6f}s, std = {einsum_std:.6f}s")

# 清理显存
torch.cuda.empty_cache()

# BMM
bmm_avg, bmm_std = benchmark_method(bmm_method, X, W)
print(f"BMM: avg = {bmm_avg:.6f}s, std = {bmm_std:.6f}s")

# 清理显存
torch.cuda.empty_cache()

# Broadcast Matmul
broadcast_avg, broadcast_std = benchmark_method(broadcast_matmul_method1, X, W)
print(f"Broadcast Matmul1: avg = {broadcast_avg:.6f}s, std = {broadcast_std:.6f}s")

# Broadcast Matmul
broadcast_avg, broadcast_std = benchmark_method(broadcast_matmul_method2, X, W)
print(f"Broadcast Matmul2: avg = {broadcast_avg:.6f}s, std = {broadcast_std:.6f}s")

总结

结论：

使用matmul进行高维矩阵乘法的时候，如果用了unsqueeze，会增加矩阵的维度，拖慢运行时间，所以大家在计算的时候要避免改变矩阵维度。尽量用transpose或者permute之类的方法。

比较：

如果使用transpose，我们先进行X.transpose(0,1)，(B,C,D)->(C,B,D)，问题变为：(C,B,D)@(C,D,O)，此时C个(B,D)与C个(D,O)分别相乘，也就是C个(B,D)@(D,O)

如果使用unsqueeze，我们先X.unsqeeze(-2)，(B,C,1,D)->(C,B,D)，问题变为：(B,C,1,D) @ (C,D,O) ，此时会进行广播，又变为：(B,C,1,D) @ (B,C,D,O)，变成了四维的运算？所以更复杂了？

疑问：

感觉总的计算量并没有变化，不知道问题出在哪里，只觉上的问题就是从三维矩阵运算变成四维了，所以效率低了，如果有懂的大佬可以评论区留言。







评论区一些大佬说测量时间不准，要用profile，但是我对这方面也不是很懂，又让gpt写了一个，测试代码如下。虽然可能测的时间不准，但是不同实验的对比控制了变量，感觉得到的结论基本是正确的。

import torch
from torch.profiler import profile, record_function, ProfilerActivity

# 确保在 GPU 上
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 设置随机种子
torch.manual_seed(0)

B, channel, d_model, out_dim = 64, 128, 256, 512
X = torch.randn(B, channel, d_model, device=device, dtype=torch.float32)
W = torch.randn(channel, d_model, out_dim, device=device, dtype=torch.float32)

def method_einsum(X, W):
    return torch.einsum('bcd,cdo->bco', X, W)

def method_unsqueeze(X, W):
    # (X.unsqueeze(-2) @ W).squeeze(-2)
    return (X.unsqueeze(-2) @ W).squeeze(-2)

# 使用 profiler
with profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA], 
             record_shapes=True, 
             profile_memory=True) as prof:
    with record_function("forward_einsum"):
        out_einsum = method_einsum(X, W)
    torch.cuda.synchronize()  # 确保同步
    with record_function("forward_unsqueeze"):
        out_unsqueeze = method_unsqueeze(X, W)
    torch.cuda.synchronize()

print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))

测试结果如下：

(torch240) root@xxx:/home/xxx/work/xxx# python test.py
WARNING:2024-12-19 06:36:11 2047:2047 init.cpp:174] function cbapi->getCuptiStatus() failed with error CUPTI_ERROR_NOT_INITIALIZED (15)
WARNING:2024-12-19 06:36:11 2047:2047 init.cpp:175] CUPTI initialization failed - CUDA profiler activities will be missing
INFO:2024-12-19 06:36:11 2047:2047 init.cpp:177] If you see CUPTI_ERROR_INSUFFICIENT_PRIVILEGES, refer to https://developer.nvidia.com/nvidia-development-tools-solutions-err-nvgpuctrperm-cupti
------------------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  
                    Name    Self CPU %      Self CPU   CPU total %     CPU total  CPU time avg       CPU Mem  Self CPU Mem      CUDA Mem  Self CUDA Mem    # of Calls  
------------------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  ------------  
          forward_einsum         1.39%       3.452ms        27.58%      68.716ms      68.716ms           0 b           0 b      24.12 Mb           0 b             1  
            aten::einsum         1.18%       2.935ms        26.19%      65.264ms      65.264ms           0 b           0 b      24.12 Mb           0 b             1  
         aten::unsqueeze         0.74%       1.840ms         0.74%       1.856ms     618.566us           0 b           0 b           0 b           0 b             3  
        aten::as_strided         0.01%      32.526us         0.01%      32.526us       2.957us           0 b           0 b           0 b           0 b            11  
           aten::permute         0.02%      37.553us         0.02%      46.432us       9.286us           0 b           0 b           0 b           0 b             5  
           aten::reshape         4.35%      10.847ms        56.37%     140.465ms      35.116ms           0 b           0 b       4.00 Gb           0 b             4  
    aten::_reshape_alias         0.00%      10.953us         0.00%      10.953us      10.953us           0 b           0 b           0 b           0 b             1  
              aten::view         0.01%      22.094us         0.01%      22.094us       5.524us           0 b           0 b           0 b           0 b             4  
               aten::bmm        38.35%      95.549ms        38.35%      95.549ms      47.775ms           0 b       


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-73ed08e164d30abb0aa301b8b4212acf_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://picx.zhimg.com/v2-73ed08e164d30abb0aa301b8b4212acf_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-309b651fd65d15a6b74590c6c82e00cf_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

![图片](https://pica.zhimg.com/v2-c870a7ca7a3ab28928c3bd349fd86271_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-309b651fd65d15a6b74590c6c82e00cf_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-8ab096c3d94621cd1d939496cc3ddfc3_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-57fe7feb4813331d5eca02ef731e12c9.jpg?source=88ceefae)

![图片](https://pica.zhimg.com/v2-10b20470e80a6274affe25aeba407dce_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-da9d3d979b3596369889fa084a684700_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-10b20470e80a6274affe25aeba407dce_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-73ed08e164d30abb0aa301b8b4212acf_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-b1e066fb7f6ac02f2b0d874bc2858b13_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-25ac7c0d6225fc37e7f4419d75895b22_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-e5aeb4872c80f1b3edccc46617dfe3de_l.jpg?source=06d4cd63)

