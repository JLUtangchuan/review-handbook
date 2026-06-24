---
title: "百面LLM-81"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/8760994183
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-81

> @swtheking | https://zhuanlan.zhihu.com/p/8760994183

---

提问：我们应该在Adam优化器下怎么调整batch size和lr，保证最终的效果能达到同样的效果？

回答：

Adam优化器是：

Adam 是一种自适应学习率优化算法，全称为 "Adaptive Moment Estimation"。它结合了动量法和 RMSProp 的优点，具有计算效率高、占用内存少、适合大规模数据和参数的特点，并且具有自适应调整学习率的能力。

### 1. Adam 优化器的基本原理

Adam 在更新参数时，结合了动量法和 RMSProp 的思想。动量法通过引入梯度的一阶矩估计来加速收敛，而 RMSProp 则通过二阶矩估计自适应调整学习率。Adam 同时计算梯度的一阶矩和二阶矩的估计，并利用二者来更新参数。

### 2. 具体步骤和公式

Adam 优化器的更新步骤如下：

1. **初始化参数**：

- 时刻 $t$，初始化时间步 $t = 0$
- 初始化一阶矩估计 $m_0 = 0$
- 初始化二阶矩估计 $v_0 = 0$
- 步长（学习率） $\alpha$
- 一阶矩估计的衰减率 $\beta_1 \in [0, 1)$
- 二阶矩估计的衰减率 $\beta_2 \in [0, 1)$
- 防止分母为零的小量 $\epsilon = 10^{-8}$

2. **计算梯度**：

- 计算损失函数关于参数 $\theta_t$ 的梯度 $g_t = \nabla_\theta f_t(\theta_{t-1})$

3. **更新一阶矩估计和二阶矩估计**：

\[
m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t
\]

\[
v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2
\]

4. **对一阶矩估计和二阶矩估计进行偏差校正**：

\[
\hat{m}_t = \frac{m_t}{1 - \beta_1^t}
\]

\[
\hat{v}_t = \frac{v_t}{1 - \beta_2^t}
\]

5. **更新参数**：

\[
\theta_t = \theta_{t-1} - \alpha \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
\]

### 3. 参数解释

- **学习率 $\alpha$**：控制梯度下降步伐的大小。Adam 的默认值为 0.001，然而这个值可以根据具体问题进行调整。
- **一阶矩估计的衰减率 $\beta_1$**：通常设置为 0.9。较大值确保了算法关注于长期方向。
- **二阶矩估计的衰减率 $\beta_2$**：通常设置为 0.999。较大值确保了算法能稳定估算梯度的变化幅度。
- **偏差校正**：由于初始化时一阶矩和二阶矩估计的初始值为 0，因此在初期会有偏差，通过偏差校正使得在初期的估计更准确。

### 4. 优点

- **自适应学习率**：每个参数都有自己适应的学习率，有助于在不同的参数维度上以不同的速度收敛。
- **计算效率高**：仅需一阶导数信息，且计算开销较低，内存需求小。
- **鲁棒性强**：在处理稀疏梯度和非平稳目标时表现尤为优异。

### 5. 缺点

- **对超参数敏感**：虽然 Adam 的默认参数通常表现良好，但在某些问题上可能需要进行超参数调优。
- **泛化性能**：某些情况下，Adam 优化器有可能比随机梯度下降（SGD）更容易陷入局部极小值，或导致较差的泛化性能。

### 6. 实际应用

Adam 优化器在许多深度学习应用中表现出色，如图像分类、自然语言处理和强化学习等。由于其鲁棒性和自适应性，它已成为深度学习研究和应用中的首选优化方法之一。

总之，Adam 是一种强大且广泛使用的优化算法，通过结合动量和排名平均，能够有效地应对大规模和高维数据优化问题。

当我们把batch size扩大c倍的时候 [1]：

我们需要扩展步长，lr为原始的 \sqrt{c} 倍.
降低exponential decay rates \beta_1 和 \beta_2 为 \beta_1^{-\frac{1}{c}} 和 \beta_2^{-\frac{1}{c}} .

[1] Does batch size matter?

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c98cb92fa837dba50400180659847d2e.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-bc2e2435d1e5f83adb872124d4ae9419.webp)

