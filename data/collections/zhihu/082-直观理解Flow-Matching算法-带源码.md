---
title: "直观理解Flow Matching算法（带源码）"
author: "张云聪"
source_url: https://zhuanlan.zhihu.com/p/28731517852
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 直观理解Flow Matching算法（带源码）

> 作者: 张云聪 | 来源: https://zhuanlan.zhihu.com/p/28731517852

---

目前不少讲Flow Matching的文章都上来一大堆概念，一大堆公式，搞得人头皮发麻，但实际上这个算法没那么复杂，代码也很容易理解。
本文不推导公式、无高深数学概念即可理解flow matching算法，并完成一个简单的代码实战。

算法原理
Related Works

Flow Matching是一种生成式模型。
最简单的生成式模型，目标就是没输入的情况下，就能生成与给定目标集中的样本相近的样本。

举个例子，可以直接无提示的用diffusion模型来生成图片。

带提示的生成式任务是可以基于无提示的生成式任务简单实现的，这里我们先只考虑无提示的生成式任务。

由于我们一般学的是一个映射，拿一个空输入映射成不同的样本不太符合映射的定义，因此，我们一般实际上会生成一堆随机值作为输入，要学的就是如何从随机值生成目标集中的一个随机样本。
如图片生成模型，经常就会用先生成一个随机图片，然后学的就是如何把这个图修改成一个目标集中的样本。


我们如果直接拿一个MLP，学随机数据到目标数据的映射，经常得到的结果并不是很好，因为随机数据中几乎不包含有用信息，相近的两个随机数据，很有可能映射到的是两个完全不同的样本。这就导致模型学到的很有可能是目标集许多图的各个像素的均值，并不是一个有意义的图片。


考虑另一个任务，如果我们把目标集遮挡少量像素，让模型来推测原始目标集，则是一个极其简单的任务，一方面是因为遮挡的像素与周边的像素间有很强的相关性，另一方面，因为输入信息中存在很多信息，这些信息使得模型可以确定这张目标图的可能性从原本的全部图片坍缩到少量特定的状态，这样的话剩余的少量特定状态的平均值也经常是一个有效的生成结果。


那么一个常见的生成图片的办法就是先用模型生成一个像素，再用第一个像素作为输入预测第二个像素，再拿前两个像素作为输入预测第三个...直到整张图预测出来。这种方法，每个像素确定后，它附近的像素就坍缩到了几种特定的状态，越来越多像素确定后，整张图就坍缩到了基本固定的状态中。使得整张图片不会呈现出多种状态的均值叠加态。


这个NLP任务也展示了为什么有时自回归可以比直接整批预测得到更好的结果：『老师』和『演员』两个模态都不错时，有时容易预测出『老员』这种四不像。而自回归，确定了『老』字之后把它作为输入，再让它预测就只能回答『师』了。


前边讲这种自回归的方案生成图片效果很好，但要为每个像素调用一次模型，效率极低。
想改进效率最简单的想法就是一次生成一个区域的图片，但区域的图片越大，就越容易出现整个区域均值叠加的问题。
于是有一种改进办法是一次生成的一批像素尽可能远一些，这样他们之间的关联较小，前边的问题就影响相对较小。
而diffusion算法，则是学一种降噪算法，它会自动判断图片中的噪声是啥，并尝试恢复原图。


但如果直接一步用一张全是噪声的随机图来生成原图，则依然存在前述可能性过多而导致结果是多种可能均值的问题，因此，diffusion会进行初步的降噪，然后再尝试根据降噪的输出结果作为输入，再次尝试降噪，这次降噪时，因为已经有了前次的输出作为输入，更多的输入把结果坍缩成了少量的状态。这样经过多次迭代降噪，结果越来越坍缩，就规避掉了前边的结果为均值的问题。diffusion具体算法原理不是本文重点，就不多讲细节了。

Flow Matching

diffusion算法效果不错，但效率依然不够高，是否有一些更直接高效的方法？
当然有，本文flow matching方法就是一种现在应用广泛的方案，在Stable Diffusion 3、Meta MovieGen中都使用flow matching替代了扩散模型（flow matching也可以看做是一种特殊的扩散模型）。


我们现在把问题简化，考虑一个比较简单的生成式任务，我们要做一个模型，这个模型用来生成一些二维空间的坐标点。
这些目标坐标点可能拥有某些特征，例如，他们可能都在某个特定的形状内，如下图中Pdata(x)中的这些点。


我们要学习的就是一个Generator G，它输入一个随机二维坐标，生成与Pdata(x)中的点尽可能像的一个点。


特别的，假设我们要生成的Pdata都是在[0, 4pi)区间内的y = sin(x)曲线上的点，那么，我们想训练一个模型，希望能让这个模型学习到这些点的特征，并能够生成一个满足这些特征的任意的点。


Flow Matching算法，要学的是一个行驶（修正）的方向，即，如果我有一个点，可以移动，我该怎么走，才能走到目标点上。




它学习的时候，会在source->target路线上采样出一堆点，然后简单直接的认为source到target这条直线上所有的点，都应该直接朝着target方向走。

训练时：

对于每一个target样本，生成一个随机的输入(source)，在这个例子里即一个随机坐标（shape与target相同）
然后连线source->target，并采样N步，对中间的采样点，调用一个网络，预测其斜率是多少，然后拿source->target的斜率作为监督值。（实际上预测的不仅仅是斜率，而是速度场，也就是移动的方向和单位时间内移动的距离，在粗理解时，在二维空间上可以先简单理解成斜率。）



我们可以发现，同一个中间点可能会受到多组source->target连线的影响，因此最终学到每个点的斜率可能是多条连线斜率的均值。


在推理时，可以从source出发，一步步往target走，一开始会沿着多条线的均值行动，但行走的过程中，越接近某个特定的target时，它就越坍缩到某个固定的状态，最终走到某个与目标集相近的样本上。

代码

代码十分简单：

import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import numpy as np

# 超参数
dim = 2         # 数据维度（2D点）
num_samples = 1000
num_steps = 50  # ODE求解步数
lr = 1e-3
epochs = 5000

# 目标分布：正弦曲线上的点（x1坐标）
x1_samples = torch.rand(num_samples, 1) * 4 * torch.pi  # 0到4π
y1_samples = torch.sin(x1_samples)                      # y=sin(x)
target_data = torch.cat([x1_samples, y1_samples], dim=1)

# 噪声分布：高斯噪声（x0坐标）
noise_data = torch.randn(num_samples, dim) * 2

class VectorField(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim + 1, 64),  # 输入维度: x (2) + t (1) = 3
            nn.ReLU(),
            nn.Linear(64, dim)
        )
  
    def forward(self, x, t):
        # 直接拼接x和t（t的形状需为(batch_size, 1)）
        return self.net(torch.cat([x, t], dim=1))
        
model = VectorField()
optimizer = torch.optim.Adam(model.parameters(), lr=lr)

for epoch in range(epochs):
    # 随机采样噪声点和目标点
    idx = torch.randperm(num_samples)
    x0 = noise_data[idx]  # 起点：噪声
    x1 = target_data[idx] # 终点：正弦曲线

    # 时间t的形状为 (batch_size, 1)
    t = torch.rand(x0.size(0), 1)  # 例如：shape (1000, 1)
  
    # 线性插值生成中间点
    xt = (1 - t) * x0 + t * x1
  
    # 模型预测向量场（直接传入t，无需squeeze）
    vt_pred = model(xt, t)  # t的维度保持不变
  
    # 目标向量场：x1 - x0
    vt_target = x1 - x0
  
    # 损失函数
    loss = torch.mean((vt_pred - vt_target)**2)
  
    # 反向传播
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

x = noise_data[0:1]  # 初始噪声点
trajectory = [x.detach().numpy()]

tag = torch.from_numpy(np.array([1]))
# 数值求解ODE（欧拉法）
t = 0
delta_t = 1 / num_steps
with torch.no_grad():
    for i in range(num_steps):
        vt = model(x, torch.tensor([[t]], dtype=torch.float32))
        t += delta_t
        x = x + vt * delta_t  # x(t+Δt) = x(t) + v(t)Δt
        trajectory.append(x.detach().numpy())

trajectory = torch.tensor(trajectory).squeeze()

print(trajectory[-1] / (torch.pi / 10 * 4))

# 绘制向量场和生成轨迹
plt.figure(figsize=(10, 5))
plt.scatter(target_data[:,0], target_data[:,1], c='blue', label='Target (sin(x))')
plt.scatter(noise_data[:,0], noise_data[:,1], c='red', alpha=0.3, label='Noise')
plt.plot(trajectory[:,0], trajectory[:,1], 'g-', linewidth=2, label='Generated Path')
plt.legend()
plt.title("Flow Matching: From Noise to Target Distribution")
plt.show()




带提示词的生成式模型


从无提示词的生成式模型变成带提示词的生成式模型还是比较简单的，提示词不限于文本、语音、数字等任意输入。
一般就是在训练过程中，预测斜率的网络添加一个prompt的输入，其他都不变即可。而对于复杂prompt可能需要一些前置的网络把提示词转成一个比较好的latent表达。


对前述代码简单修改，即可完成把target线分成10段，tag为0时，生成最左边一段上的点，即[0, 4*pi/10)，tag为1时生成左二段上的点，以此类推。


代码如下（仅少量行与前边代码有少许区别）：

import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import numpy as np

# 超参数
dim = 2         # 数据维度（2D点）
num_samples = 1000
num_steps = 50  # ODE求解步数
lr = 1e-3
epochs = 5000

# 目标分布：正弦曲线上的点（x1坐标）
x1_samples = torch.rand(num_samples, 1) * 4 * torch.pi  # 0到4π
y1_samples = torch.sin(x1_samples)                      # y=sin(x)
target_data = torch.cat([x1_samples, y1_samples], dim=1)
tags = torch.from_numpy(np.array([[int(x1_samples[i] / (4 * torch.pi / 10.0)),] for i in range(num_samples)]))

# 噪声分布：高斯噪声（x0坐标）
noise_data = torch.randn(num_samples, dim) * 2

class VectorField(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim + 2, 64),  # 输入维度: x (2) + t (1) + tag(1) = 4
            nn.ReLU(),
            nn.Linear(64, dim)
        )
  
    def forward(self, x, t, tag):
        # 直接拼接x和t（t的形状需为(batch_size, 1)）
        return self.net(torch.cat([x, t, tag], dim=1))
        #return self.net(torch.cat([x, t], dim=1))
model = VectorField()
optimizer = torch.optim.Adam(model.parameters(), lr=lr)

for epoch in range(epochs):
    # 随机采样噪声点和目标点
    idx = torch.randperm(num_samples)
    x0 = noise_data[idx]  # 起点：噪声
    x1 = target_data[idx] # 终点：正弦曲线

    # 时间t的形状为 (batch_size, 1)
    t = torch.rand(x0.size(0), 1)  # 例如：shape (1000, 1)
  
    # 线性插值生成中间点
    xt = (1 - t) * x0 + t * x1
  
    # 模型预测向量场（直接传入t，无需squeeze）
    vt_pred = model(xt, t, tags[idx])  # t的维度保持不变
  
    # 目标向量场：x1 - x0
    vt_target = x1 - x0
  
    # 损失函数
    loss = torch.mean((vt_pred - vt_target)**2)
  
    # 反向传播
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# 从噪声出发，解ODE生成数据
x = noise_data[0:1]  # 初始噪声点
trajectory = [x.detach().numpy()]

tag_num = 1
tag = torch.from_numpy(np.array([tag_num]))

# 数值求解ODE（欧拉法）
t = 0
delta_t = 1 / num_steps
with torch.no_grad():
    for i in range(num_steps):
        vt = model(x, torch.tensor([[t]], dtype=torch.float32), tag.reshape([1,1]))
        t += delta_t
        x = x + vt * delta_t  # x(t+Δt) = x(t) + v(t)Δt
        trajectory.append(x.detach().numpy())

trajectory = torch.tensor(trajectory).squeeze()

print(trajectory[-1] / (torch.pi / 10 * 4))

# 绘制向量场和生成轨迹
plt.figure(figsize=(10, 5))
plt.scatter(target_data[:,0], target_data[:,1], c='blue', label='Target (sin(x))')
plt.scatter(noise_data[:,0], noise_data[:,1], c='red', alpha=0.3, label='Noise')
plt.plot(trajectory[:,0], trajectory[:,1], 'g-', linewidth=2, label='Generated Path')
plt.legend()
plt.title("Flow Matching: From Noise to Target Distribution")
plt.show()


第80行输出了：tensor([1.4376, 0.6455])，落在了区间1里，和tag_num=1匹配，说明模型根据提示词生成了正确区间内的数据。

更真实的例子——手写数字生成

在mnist数据集上flow matching做手写数字生成，输入数字，生成手写体数字图片。

以下代码有几个关键点：

选用UNet作为预测速度场的backbone网络，主要是因为它有多尺度特征融合能力，在主流生成式模型中体现了很强的性能。
在推理时把线性按delta_t往目标走，改成了自适应变步长的走法，可以用在相同步数时，得到更精细的结果（毕竟一开始不用走那么精准，t越接近1，越需要精调）。这个只改了推理，并未影响训练逻辑。
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
from torchvision import transforms
from torch.utils.data import DataLoader
from torchdiffeq import odeint
import matplotlib.pyplot as plt

# ================== 配置参数 ==================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
image_size = 28
channels = 1
batch_size = 256
lr = 1e-4
epochs = 100
num_classes = 10

# ================== 数据加载 ==================
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Lambda(lambda x: 2 * x - 1)  # [-1, 1] 归一化
])

train_dataset = torchvision.datasets.MNIST(
    root='./data', train=True, download=True, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2)

# ================== 模型架构 ==================
class ConditionedDoubleConv(nn.Module):
    """带条件注入的双卷积模块"""
    def __init__(self, in_channels, out_channels, cond_dim):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        self.norm1 = nn.GroupNorm(8, out_channels)
        self.conv2 = nn.Conv2d(out_channels + cond_dim, out_channels, kernel_size=3, padding=1)
        self.norm2 = nn.GroupNorm(8, out_channels)
      
    def forward(self, x, cond):
        x = F.silu(self.norm1(self.conv1(x)))
        cond = cond.expand(-1, -1, x.size(2), x.size(3))  # 动态广播条件
        x = torch.cat([x, cond], dim=1)
        return F.silu(self.norm2(self.conv2(x)))

class Down(nn.Module):
    """下采样模块"""
    def __init__(self, in_channels, out_channels, cond_dim):
        super().__init__()
        self.maxpool = nn.MaxPool2d(2)
        self.conv = ConditionedDoubleConv(in_channels, out_channels, cond_dim)
      
    def forward(self, x, cond):
        x = self.maxpool(x)
        return self.conv(x, cond)

class Up(nn.Module):
    """上采样模块"""
    def __init__(self, in_channels, out_channels, cond_dim):
        super().__init__()
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
        self.conv = ConditionedDoubleConv(in_channels, out_channels, cond_dim)
      
    def forward(self, x1, x2, cond):
        x1 = self.up(x1)
        # 尺寸对齐
        diffY = x2.size()[2] - x1.size()[2]
        diffX = x2.size()[3] - x1.size()[3]
        x1 = F.pad(x1, [diffX//2, diffX - diffX//2,
                        diffY//2, diffY - diffY//2])
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x, cond)

class ConditionalUNet(nn.Module):
    """维度安全的条件生成UNet"""
    def __init__(self):
        super().__init__()
        # 统一条件编码维度
        self.t_dim = 16
        self.label_dim = 16
        self.cond_dim = self.t_dim + self.label_dim  # 32
      
        # 时间嵌入
        self.time_embed = nn.Sequential(
            nn.Linear(1, 32),
            nn.SiLU(),
            nn.Linear(32, self.t_dim)
        )
        # 标签嵌入
        self.label_embed = nn.Embedding(num_classes, self.label_dim)
      
        # 编码路径
        self.inc = ConditionedDoubleConv(1, 64, self.cond_dim)
        self.down1 = Down(64, 128, self.cond_dim)
        self.down2 = Down(128, 256, self.cond_dim)
      
        # 解码路径
        self.up1 = Up(256 + 128, 128, self.cond_dim)  # 输入通道修正
        self.up2 = Up(128 + 64, 64, self.cond_dim)
        self.outc = nn.Conv2d(64, 1, kernel_size=1)
      
    def forward(self, x, t, labels):
        # 条件编码 (统一维度)
        t_emb = self.time_embed(t.view(-1, 1))  # [B, 16]
        lbl_emb = self.label_embed(labels)      # [B, 16]
        cond = torch.cat([t_emb, lbl_emb], dim=1)  # [B, 32]
        cond = cond.unsqueeze(-1).unsqueeze(-1)    # [B, 32, 1, 1]
      
        # 编码器
        x1 = self.inc(x, cond)
        x2 = self.down1(x1, cond)
        x3 = self.down2(x2, cond)
      
        # 解码器
        x = self.up1(x3, x2, cond)
        x = self.up2(x, x1, cond)
        return self.outc(x)

# ================== 训练与生成 ==================
model = ConditionalUNet().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=lr)

@torch.no_grad()
def generate_with_label(label, num_samples=16, device="cuda"):
    """生成指定标签的样本（修复条件维度问题）"""
    model.eval()
  
    # 初始噪声和标签
    x0 = torch.randn(num_samples, 1, 28, 28, device=device)
    labels = torch.full((num_samples,), label, device=device, dtype=torch.long)
  
    # 定义ODE函数
    def ode_func(t: torch.Tensor, x: torch.Tensor):
        t_expanded = t.expand(x.size(0))  # [1] -> [num_samples]
        vt = model(x, t_expanded, labels)
        return vt
  
    # 时间点（从0到1）
    t_eval = torch.tensor([0.0, 1.0], device=device)
  
    # 解ODE（自适应步长）
    generated = odeint(
        ode_func,
        x0,
        t_eval,
        rtol=1e-5,
        atol=1e-5,
        method='dopri5'
    )
  
    # 后处理
    images = (generated[-1].clamp(-1, 1) + 1) / 2  # [0,1]
    return images.cpu().squeeze(1)  # 移除通道维度

def visualize_samples(samples, title="Generated Samples"):
    """可视化生成结果"""
    plt.figure(figsize=(10, 10))
    for i in range(16):
        plt.subplot(4, 4, i+1)
        plt.imshow(samples[i].squeeze().cpu().numpy(), cmap='gray', vmin=0, vmax=1)
        plt.axis('off')
    plt.suptitle(title)
    plt.show()

def plot_100_digits(image_size=28, device="cuda"):
    """
    生成0-9各10张数字并绘制在10x10网格中
    Args:
        model: 训练好的生成模型
        image_size: 图像尺寸（默认MNIST为28）
        device: 计算设备
    """
    plt.figure(figsize=(8, 8))
  
    # 为每个数字0-9生成10张图
    for label in range(10):
        # 生成当前数字的10个样本
        generated = generate_with_label(
            label=label,
            num_samples=10
        ).numpy()  # 形状 (10, 28, 28)
      
        # 在当前行绘制
        for i in range(10):
            ax = plt.subplot(10, 10, i * 10 + 1 + label)
            plt.imshow(generated[i], cmap='gray')
            ax.axis('off')
            # 在每列第一行添加标签
            if i == 0:
                ax.text(14, -10, str(label), fontsize=20, ha='center')
  
    plt.tight_layout()
    plt.show()

def train():
    """训练循环"""
    for epoch in range(epochs):
        model.train()
        total_loss = 0
      
        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)
          
            # 动态噪声生成
            noise = torch.randn_like(images)
            t = torch.rand(images.size(0), device=device)
            xt = (1 - t.view(-1,1,1,1)) * noise + t.view(-1,1,1,1) * images
          
            # 前向计算
            vt_pred = model(xt, t, labels)
            loss = F.mse_loss(vt_pred, images - noise)
          
            # 反向传播
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
          
            total_loss += loss.item()
      
        # 每10个epoch生成示例
        if epoch % 10 == 0:
            plot_100_digits()
        
        print(f"Epoch {epoch} Loss: {total_loss/len(train_loader):.4f}")

if __name__ == "__main__":
    train()

注：文中讲的是Flow Matching中的一种常见特殊实现Condition Flow Matching。

本文只有直观理解，但缺少了严格数学证明。建议读者们之后还是要回过去理解原理，因为这样才能更灵活的运用。


参考资料
通俗易懂理解Flow Matching
解密为什么 Diffusio


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/8efe28c95_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-9ab53b46703915354d443b27b5e502fc_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-94f13a5f40b9b2383aa69d6973359e4b_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-294b6c4912ddc652077b1827db10a32f_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-9ceb633866225b72e0e4a24cfe90a1eb_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-24a48ff1d719a138141538d983669fe4_1440w.jpg)

![图片](https://picx.zhimg.com/v2-06c07541c2e2e348bfa3d698bcaca151_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-80220fde7446f6c9ce20be9ba9875b71_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-5d11ce4f5cbc3d9f002b4b1d00ceb139.webp)

![图片](https://picx.zhimg.com/v2-c1dcb0aad8269cda6ba80a151bb7c0e7_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-aa15ce4a2bfe1ca54c8bb6cc3ea6627b.png)

![图片](https://picx.zhimg.com/v2-ffe8c9c11f94287c9a613a42137de227_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/8efe28c95_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-af93c144d221a650595ad22d153edc5a_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-3bb879be3497db9051c1953cdf98def6.png)

![图片](https://picx.zhimg.com/v2-e3bf83738329d7e5e6eeaa9d36422f4a_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-2e5104f991f9d6644c36cc8fb4be3cea_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-0942128ebfe78f000e84339fbb745611.png)

![图片](https://picx.zhimg.com/v2-74d513757968bfe0717df8ef7c31c282_l.jpg?source=06d4cd63)

