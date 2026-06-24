---
title: "百面LLM-84"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/12497038475
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-84

> @swtheking | https://zhuanlan.zhihu.com/p/12497038475

---

提问：KL penalty这种做法在RLHF中有什么问题？

回答：

KL Distance不一定能反应模型被修改的程度，因为可能存在多个具有固定KL Distance的Policy，但其实模型被修改的程度可能完全不同～～
实践中，在有限的样本里，估计KL Distance，可能是估计不准的。举例子来说，当响应长度变化很大的时候，可能很难从KL Distance中反应出来。

在这里我们写了个程序表现这个形式：（大家也可帮我check一下程序）

import numpy as np
from scipy.special import rel_entr
import matplotlib.pyplot as plt

# 设置随机种子以使结果可重复
np.random.seed(0)

# 定义模拟序列生成函数
def generate_sequences(length, vocab_size=5, eos_token=0):
    sequences = []
    true_length = length
    i = 0
    for _ in range(length):
        sequence = np.random.rand(vocab_size)
        sequence /= sequence.sum()  # 归一化，使总和为1
        sequences.append(sequence)

        # 当第一个token的概率是最高值时，认为是<eos>，记录长度
        if sequence[0] == np.max(sequence) and true_length == length:
            true_length = i+1
        i += 1
    return np.array(sequences), true_length

# 计算 KL 距离的函数
def calculate_kl_distance(sample1, sample2):
    kl_div = np.sum(rel_entr(sample1, sample2), axis=1)
    return np.mean(kl_div) #标准应该是np.sum。

# 固定样本长度
base_length = 1000

kl_distances = []
sequence_lengths = []
for _ in range(100):
    fixed_sample, fix_length = generate_sequences(base_length, 5)  # 固定样本
    varying_sample, seq_length = generate_sequences(base_length, 5)  # 变化样本

    # 计算 KL 距离
    kl_div = calculate_kl_distance(fixed_sample, varying_sample)
    kl_distances.append(kl_div)

    sequence_lengths.append(seq_length - fix_length)

# 绘制 KL 距离随着样本长度变化的曲线
plt.figure(figsize=(10, 6))
plt.scatter(sequence_lengths, kl_distances)
plt.title('KL Distance vs Sample Length')
plt.xlabel('Sample Length')
plt.ylabel('KL Distance')
plt.grid(True)
plt.legend()

plt.show()

图片为：

那么同一个length断的时候（比如 KL = 10），KL可能的变化很大。

最后注意一下，我们这里计算的KL distance，和RLHF里实现的KL reward还不太一样，因为RLHF会计算到<eos>位置就结束了。（具体细节可以看 Reinforcement Learning From Human Feedback 第5章。）

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-82b6738730c96f3c6e5cebec3250fecf_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-218353271a747b4cc23356d728118361.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-e17602e8876453915c8b5905aa0340b2.webp)

