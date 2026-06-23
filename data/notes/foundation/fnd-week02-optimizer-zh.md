---
id: fnd-week02-optimizer-zh
title: "重新思考学习率与Batch Size（三）：Muon"
type: foundation
week: 2
topics: ["optimizers"]
tags:
- name: "来自知乎"
  initial_weight: 1.0
difficulty: 3
status: pending
rating: 0
created_at: "2026-06-23"
updated_at: "2026-06-23"
sources:
- platform: zhihu
  url: "https://zhuanlan.zhihu.com/p/1958228593369921194"
  title: "重新思考学习率与Batch Size（三）：Muon"
  saved_at: "2026-06-23"
recommendations: []
---

# 重新思考学习率与Batch Size（三）：Muon

> 作者: 苏剑林 | 来源: https://zhuanlan.zhihu.com/p/1958228593369921194

---

最佳排版请看原博客：

前两篇文章《重新思考学习率与Batch Size（一）：现状》和《重新思考学习率与Batch Size（二）：平均场》中，我们主要是提出了平均场方法，用以简化学习率与Batch Size的相关计算。当时我们分析的优化器是SGD、SignSGD和SoftSignSGD，并且主要目的是简化，本质上没有新的结论。

然而，在如今的优化器盛宴中，怎能少得了Muon的一席之地呢？所以，这篇文章我们就来尝试计算Muon的相关结论，看看它的学习率与Batch Size的关系是否会呈现出新的规律。

基本记号

众所周知，Muon的主要特点就是非Element-wise的更新规则，所以之前在《当Batch Size增大时，学习率该如何随之变化？》和《Adam的epsilon如何影响学习率的Scaling Law？》的Element-wise的计算方法将完全不可用。但幸运的是，上篇文章介绍的平均场依然好使，只需要稍微调整一下细节。

我们先引入一些记号。设损失函数为\mathcal{L}(\boldsymbol{W})，\boldsymbol{W}\in\mathbb{R}^{n\times m}是矩阵向量（设n\geq m），\boldsymbol{G}是它的梯度，单个样本的梯度记为\tilde{\boldsymbol{G}}，它的均值就是\boldsymbol{G}，而方差为\sigma^2；当Batch Size为B时，梯度记为\tilde{\boldsymbol{G}}_B，它的均值还是\boldsymbol{G}，但方差变为\sigma^2/B。注意，这里的方差只是一个标量\sigma^2，并不像之前那样考虑了完整的协方差矩阵。

之所以这样简化，最核心的原因是这里的随机变量本身就已经是一个矩阵，那么它对应的协方差矩阵实际上已经是一个4阶张量，这讨论起来比较麻烦。那么简化为单个标量会严重损失准确性吗？其实不会，前两篇文章我们虽然考虑了完整的协方差矩阵\boldsymbol{\Sigma}，但仔细观察就会发现最后结果只依赖于\mathop{\text{tr}}(\boldsymbol{\Sigma})，这跟开始就将它简化为标量是等价的。

海森矩阵

类似地，我们设更新量为-\eta\tilde{\boldsymbol{\Phi}}_B，考虑损失函数的二阶展开

\mathcal{L}(\boldsymbol{W} - \eta\tilde{\boldsymbol{\Phi}}_B) \approx \mathcal{L}(\boldsymbol{W}) - \eta \mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{G}) + \frac{1}{2}\eta^2\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B)\tag{1}

前两项应该都没什么疑问，比较难理解的第三项。跟协方差矩阵类似，这里的Hessian矩阵\boldsymbol{H}是一个4阶张量，理解起来比较麻烦。

这里最简单的切入方式应该是线性算子视角，即将\boldsymbol{H}理解为一个输入输出都是矩阵的线性算子。我们不用知道\boldsymbol{H}长什么样，也不用知道\boldsymbol{H}与\tilde{\boldsymbol{\Phi}}_B怎么运算，只需要知道\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B关于\tilde{\boldsymbol{\Phi}}_B是线性的。这样一来，我们要处理的对象依然还是矩阵，不需要增加心智负担。任何符合条件的线性算子，都可以作为Hessian矩阵的近似，但不需要写出具体的高阶张量形式。

本文的主角是Muon，我们取\tilde{\boldsymbol{\Phi}}_B=\mathop{\text{msign}}(\tilde{\boldsymbol{G}}_B)作为它的近似来进行计算。根据定义，我们写出\mathop{\text{msign}}(\tilde{\boldsymbol{G}}_B)=\tilde{\boldsymbol{G}}_B(\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B)^{-1/2}，从牛顿法视角看，这相当于假设\boldsymbol{H}^{-1}\boldsymbol{X} = \eta_{\max}\boldsymbol{X}(\boldsymbol{G}^{\top}\boldsymbol{G})^{-1/2}，于是有\boldsymbol{H}\boldsymbol{X} = \eta_{\max}^{-1}\boldsymbol{X}(\boldsymbol{G}^{\top}\boldsymbol{G})^{1/2}，这将用于后面的计算。

计算期望

对式(1)两边求期望，得到

\mathbb{E}[\mathcal{L}(\boldsymbol{W} - \eta\tilde{\boldsymbol{\Phi}}_B)] \approx \mathcal{L}(\boldsymbol{W}) - \eta \mathop{\text{tr}}(\mathbb{E}[\tilde{\boldsymbol{\Phi}}_B]^{\top}\boldsymbol{G}) + \frac{1}{2}\eta^2\mathbb{E}[\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B)] \\

先求\mathbb{E}[\tilde{\boldsymbol{\Phi}}_B]：

\mathbb{E}[\tilde{\boldsymbol{\Phi}}_B]=\mathbb{E}[\tilde{\boldsymbol{G}}_B(\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B)^{-1/2}]\approx\mathbb{E}[\tilde{\boldsymbol{G}}_B](\mathbb{E}[\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B])^{-1/2} = \boldsymbol{G}(\mathbb{E}[\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B])^{-1/2} \\

\mathbb{E}[\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B]我们按分量写出来，并且假设不同分量之间独立，那么

\mathbb{E}[\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B]_{i,j} = \mathbb{E}\left[\sum_{k=1}^n (\tilde{G}_B)_{k,i}(\tilde{G}_B)_{k,j}\right] = \left\{\begin{aligned} \mathbb{E}\left[\sum_{k=1}^n (\tilde{G}_B)_{k,i}^2\right] = \left(\sum_{k=1}^n G_{k,i}^2\right) + n\sigma^2/B,\quad (i=j) \\[6pt] \sum_{k=1}^n \mathbb{E}[(\tilde{G}_B)_{k,i}] \mathbb{E}[(\tilde{G}_B)_{k,j}] = \sum_{k=1}^n G_{k,i}G_{k,j},\quad (i\neq j) \end{aligned}\right.\\

组合起来就是\mathbb{E}[\tilde{\boldsymbol{G}}{}_B^{\top}\tilde{\boldsymbol{G}}_B]=\boldsymbol{G}^{\top}\boldsymbol{G} + (n\sigma^2/B) \boldsymbol{I}，所以

\mathbb{E}[\tilde{\boldsymbol{\Phi}}_B]\approx \boldsymbol{G}(\boldsymbol{G}^{\top}\boldsymbol{G} + (n\sigma^2/B) \boldsymbol{I})^{-1/2} = \mathop{\text{msign}}(\boldsymbol{G})(\boldsymbol{I} + (n\sigma^2/B) (\boldsymbol{G}^{\top}\boldsymbol{G})^{-1})^{-1/2} \\

为了进一步简化B的依赖形式，我们用\mathop{\text{tr}}(\boldsymbol{G}^{\top}\boldsymbol{G})\boldsymbol{I}/m近似\boldsymbol{G}^{\top}\boldsymbol{G}，也就是只保留\boldsymbol{G}^{\top}\boldsymbol{G}的对角线部分，然后再降对角线部分替换成它们的平均。这样一来，我们得到

\mathbb{E}[\tilde{\boldsymbol{\Phi}}_B]\approx \mathop{\text{msign}}(\boldsymbol{G})(1 + \mathcal{B}_{\text{simple}}/B)^{-1/2} \\

其中\mathcal{B}_{\text{simple}} = mn\sigma^2/\mathop{\text{tr}}(\boldsymbol{G}^{\top}\boldsymbol{G})= mn\sigma^2/\Vert\boldsymbol{G}\Vert_F，这其实跟把\boldsymbol{G}当成向量，算前两篇文章的\mathcal{B}_{\text{simple}}是一样的。上式的形式跟SignSGD如出一辙，由此我们可以猜测，Muon在学习率与Batch Size的关系上不会有太多新鲜结果。

相同规律

至于\mathbb{E}[\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B)]，我们只计算刚才推出的Muon对应的假设，即\boldsymbol{H}\boldsymbol{X} = \eta_{\max}^{-1}\boldsymbol{X}(\boldsymbol{G}^{\top}\boldsymbol{G})^{1/2}，那么

\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B) = \eta_{\max}^{-1}\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\tilde{\boldsymbol{\Phi}}_B(\boldsymbol{G}^{\top}\boldsymbol{G})^{1/2}) \\

留意到\tilde{\boldsymbol{\Phi}}_B是\mathop{\text{msign}}的结果，它一定是正交矩阵（满秩），所以\tilde{\boldsymbol{\Phi}}{}_B^{\top}\tilde{\boldsymbol{\Phi}}_B=\boldsymbol{I}，即在这个case下\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B)是一个确定的常数\eta_{\max}^{-1}\mathop{\text{tr}}((\boldsymbol{G}^{\top}\boldsymbol{G})^{1/2})=\eta_{\max}^{-1}\mathop{\text{msign}}(\boldsymbol{G})^{\top}\boldsymbol{G}，于是我们可以得到

\eta^* \approx \frac{\mathop{\text{tr}}(\mathbb{E}[\tilde{\boldsymbol{\Phi}}_B]^{\top}\boldsymbol{G})}{\mathbb{E}[\mathop{\text{tr}}(\tilde{\boldsymbol{\Phi}}{}_B^{\top}\boldsymbol{H}\tilde{\boldsymbol{\Phi}}_B)]}\approx \frac{\eta_{\max}}{\sqrt{1 + \mathcal{B}_{\text{simple}}/B}} \\

果不其然，它跟SignSGD结果的形式完全一样，没有什么新鲜规律。

其实仔细想想就会发现这也是情理之中，因为SignSGD是直接对梯度加\mathop{\text{sign}}，而Muon的\mathop{\text{msign}}则是给奇异值加\mathop{\text{sign}}，直觉上就相当于换了个坐标系加\mathop{\text{sign}}，它带来的是新的矩阵更新规则，而学习率\eta^*和Batch Size B只是一个标量，在大家背后核心都是\mathop{\text{sign}}的前提下，这些标量的渐近关系极有可能不会发现明显变化。

当然，我们现在只算了一个特殊的\boldsymbol{H}，如果考虑更一般的\boldsymbol{H}，那么也有可能跟SignSGD一样出现“Batch Size增大，学习率反而应该减少”的Surge现象。但正如我们在上一篇文章的“原因反思”一节说的，如果真观察到Surge现象了，也许更应该要更换优化器，而不是修正\eta^*与B的关系。

文章小结

这篇文章我们尝试用平均场近似对Muon进行了简单分析，结论是它学习率与Batch Size的关系跟SignSGD一致，并无新鲜规律。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-6558ca50578916708daa98779d79d86f_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-6558ca50578916708daa98779d79d86f_l.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://picx.zhimg.com/v2-25c9966d55d8c293a5c55bb43d323141.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-e96a4bab27e85a39f1d74582cf1c0c61.webp)
