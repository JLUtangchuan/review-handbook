---
id: fnd-week01-attention
title: Transformer注意力机制全解：从Scaled Dot-Product到MLA
type: foundation
week: 1
topics:
- attention-arch
tags:
- name: 注意力机制
  initial_weight: 1.5
- name: MHA
  initial_weight: 1.2
- name: GQA
  initial_weight: 1.3
- name: MLA
  initial_weight: 1.4
- name: 面试高频
  initial_weight: 1.8
difficulty: 4
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-24'
recommendations:
- fnd-week01-transformer-block
- qa-week01-attn-complexity
- fnd-week10-kv-cache
- qa-week03-deepseek-mla
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6950e1de000000001e00e177
  title: MHA/MQA/GQA 一张图看懂！
  saved_at: '2026-06-22'
---

# Transformer注意力机制全解：从Scaled Dot-Product到MLA

## 来源
- [xiaohongshu] [MHA/MQA/GQA 一张图看懂！](https://www.xiaohongshu.com/explore/6950e1de000000001e00e177)

---

## 内容

### 1. Scaled Dot-Product Attention（基础公式）

Attention机制的核心是**将Query与Key进行匹配，用匹配得分加权聚合Value**。

**标准公式**：

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

其中：
- $Q \in \mathbb{R}^{n \times d_k}$：Query矩阵（n个token的查询向量）
- $K \in \mathbb{R}^{n \times d_k}$：Key矩阵
- $V \in \mathbb{R}^{n \times d_v}$：Value矩阵（通常$d_k = d_v$）
- $\sqrt{d_k}$：缩放因子，**防止点积过大导致softmax梯度消失**

**为什么除以 $\sqrt{d_k}$？**

当$d_k$较大时，$QK^T$的方差为$d_k$，值可能很大。softmax在大值区域梯度趋近于0，导致训练困难。除以$\sqrt{d_k}$使方差归一化为1。

**逐步计算**：
1. **Score**: $S = QK^T$，计算每对token的相关性分数
2. **Scale**: $\frac{S}{\sqrt{d_k}}$，缩放防止梯度消失
3. **Mask**: （可选）将padding位置或未来token的score设为$-\infty$
4. **Softmax**: $\text{softmax}(\frac{S}{\sqrt{d_k}})$，归一化为概率分布
5. **Weighted Sum**: $\text{softmax}(\frac{QK^T}{\sqrt{d_k}})V$，加权聚合Value

---

### 2. Multi-Head Attention (MHA) — 原始Transformer

MHA将$d_{model}$维的Q/K/V拆分成$h$个head，每个head在低维子空间独立做Attention，最后拼接。

**公式**：

$$
\text{MHA}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O
$$

$$
\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)
$$

其中$W_i^Q, W_i^K \in \mathbb{R}^{d_{model} \times d_k}$，$W_i^V \in \mathbb{R}^{d_{model} \times d_v}$，$W^O \in \mathbb{R}^{hd_v \times d_{model}}$

**参数量**：
- Q投影：$d_{model} \times d_k \times h = d_{model}^2$
- K投影：$d_{model} \times d_k \times h = d_{model}^2$
- V投影：$d_{model} \times d_v \times h = d_{model}^2$
- O投影：$d_{model} \times d_{model} = d_{model}^2$
- **总计**：$4d_{model}^2$

**KV Cache大小**（每个token）：
- 存储K和V各一份：$2 \times d_{model}$个float
- 对于LLaMA-7B（$d_{model}=4096$，32 heads，$d_{head}=128$）：$2 \times 4096 = 8192$个float/token/layer

**MHA优点**：每个head可以关注不同的表示子空间，表达能力最强。

**MHA缺点**：KV Cache随序列长度线性增长，长序列推理显存压力大。

---

### 3. Multi-Query Attention (MQA) — 极致省显存

MQA让所有head**共享同一组K和V**，只有Q保持多头。

**公式**：

$$
\text{head}_i = \text{Attention}(QW_i^Q, KW^K, VW^V)
$$

注意K和V只有一份投影矩阵$W^K, W^V$，所有head共用。

**KV Cache压缩**：
- MHA每token：$2 \times d_{model}$个float
- MQA每token：$2 \times d_{head}$个float
- **压缩比**：$d_{model} / d_{head} = h$（head数量）
- 对于LLaMA-7B：32倍压缩！

**MQA优点**：KV Cache大幅减小，推理显存友好。
**MQA缺点**：所有head共享K/V，不同head无法关注不同语义空间，表达能力受损。

**使用场景**：PaLM、Falcon等模型使用了MQA。

---

### 4. Grouped Query Attention (GQA) — 工业界首选

GQA在MHA和MQA之间折中：将$h$个head分成$g$个组，每组内共享K/V。

**典型配置**：
- LLaMA-2 70B: $h=64, g=8$（每8个head共享一组K/V）
- LLaMA-3: $h=32, g=8$
- Mistral: $h=32, g=4$

**KV Cache压缩比**：$h / g$

**GQA经验规律**：
- $g=1$就是MQA，$g=h$就是MHA
- $g \approx 8$通常是效果与效率的最佳平衡点
- Google的实验表明$g=8$时效果几乎不下降，KV Cache减少8倍

**为什么GQA是推理首选**：
1. KV Cache大小减至$1/(h/g)$，大幅降低推理显存
2. 效果损失极小（perplexity几乎不变）
3. 实现简单，只需修改投影矩阵的shape

---

### 5. Multi-head Latent Attention (MLA) — DeepSeek的秘密武器

MLA是DeepSeek V2/V3的核心创新，将KV Cache压缩推向极致。

**核心思想**：低秩压缩。K和V的信息冗余度很高，可以用低维latent表示。

**MLA架构**：

**训练时**（完整计算）：
1. **Down Projection**: $c_{KV} = W_{down} \cdot h$，将hidden state投影到低维latent空间（维度$d_c \ll d_{model}$）
2. **Up Projection**: $K = W_{uk} \cdot c_{KV}$，$V = W_{uv} \cdot c_{KV}$，从latent恢复到完整维度
3. 正常计算Attention

**推理时**（只存latent）：
- 只存储$c_{KV}$（一个latent向量），不存展开后的K和V
- 计算Attention时：$QK^T = Q(W_{uk} \cdot c_{KV})^T = (QW_{uk}^T) \cdot c_{KV}^T$
- 可以将$QW_{uk}^T$预先计算，避免展开K

**KV Cache压缩比**：
- 标准MHA每token：$2 \times d_{model}$
- MLA每token：$d_c$（仅一个latent向量）
- DeepSeek V2: $d_{model}=5120$, $d_c=512$，**压缩比约10倍**
- DeepSeek V3进一步优化，$d_c$可降至$128$，**压缩比超40倍**

**为什么低秩假设合理**：
1. K和V的head维度（128）远小于hidden维度（4096+），信息天然有冗余
2. 类似LoRA的原理：实际信息秩远小于矩阵维度
3. Up-projection矩阵学到的映射可以恢复注意力计算所需的关键信息

**MLA与RoPE的兼容性**：
- DeepSeek对K进行特殊处理：部分K维度保留RoPE，其余从latent生成
- 公式：$K = [K_{rope}; K_{no\text{-}rope}]$，其中$K_{rope}$单独施加旋转

---

### 6. FlashAttention — IO感知的Attention加速

FlashAttention不是改变Attention的计算，而是改变计算的**顺序和位置**。

**核心观察**：Attention的瓶颈不在计算量（FLOPS），而在**显存读写（IO）**。

**标准Attention的问题**：
1. 计算$S = QK^T$得到$n \times n$矩阵，写入HBM（高带宽显存）
2. 对S做softmax，再从HBM读回
3. 乘以V，再写回HBM

整个过程中，$O(n^2)$的Attention矩阵被反复读写，成为IO瓶颈。

**FlashAttention的解决方案**：
1. **Tiling（分块）**：将Q、K、V切分成小块，每次只加载一块到SRAM（芯片内缓存）
2. **Online Softmax**：在分块内增量计算softmax的分子分母，避免存储完整的$n \times n$矩阵
3. **Recomputation**：反向传播时不保存中间S矩阵，而是重新计算

**效果**：
- 训练速度提升2-4倍
- 显存占用从$O(n^2)$降到$O(n)$（不再存储完整attention matrix）
- 数学上等价于标准Attention（精度无损）

---

### 7. Attention家族对比总结

| 机制 | KV Cache/Token | 表达能力 | 推理显存 | 代表模型 |
|------|---------------|---------|---------|---------|
| **MHA** | $2d_{model}$ | ★★★★★ | 最大 | 原始Transformer、BERT、GPT-2 |
| **MQA** | $2d_{head}$ | ★★★ | 1/32 | PaLM、Falcon |
| **GQA** | $2d_{head} \times g/h$ | ★★★★ | 1/8 | LLaMA-2/3、Mistral、Qwen |
| **MLA** | $d_c (\approx 128)$ | ★★★★★ | 1/40 | DeepSeek V2/V3 |

**选型指南**：
- **训练**：MHA（精度优先，训练时不担心KV Cache）
- **推理**：GQA（效果与效率的最佳平衡，工业界标配）
- **极致压缩**：MLA（DeepSeek专属，低秩假设有效）
- **长序列**：FlashAttention + GQA/MLA + 外推策略（NTK/YaRN）

---

---

### 8. Attention优化四大流派（清华综述）

清华等团队的综述 *"A Survey of Efficient Attention Methods"* 将Attention优化划分为四大流派：

**流派1：硬件高效注意力（Hardware-efficient Attention）**

核心思想：不改变Attention数学公式，通过极致工程优化榨干硬件潜力。

- **目标**：最大化GPU利用率，将瓶颈从"内存"转移到"计算"
- **代表方法**：FlashAttention V1/V2/V3
- **关键技术**：Tiling分块计算、Online Softmax、IO-Awareness、利用Tensor Core
- **一句话总结**：让Attention跑得更快，不浪费任何一个时钟周期和内存带宽

**流派2：紧凑注意力（Compact Attention）**

核心思想：解耦"存储KV"和"计算KV"，大幅降低推理阶段KV Cache。

- **目标**：降低KV Cache显存，不增加计算量
- **代表方法**：GQA（分组共享）、MLA（低秩分解）
- **关键技术**：权重共享、低秩投影、训练时存完整KV推理时压缩
- **一句话总结**：存得少，算的时候展开用

**流派3：稀疏注意力（Sparse Attention）**

核心思想：softmax后的注意力矩阵$P$天然稀疏，大量元素趋近于0，只计算重要的部分。

- **目标**：直接减少FLOPs和内存访问量
- **代表方法**：Sliding Window Attention (Mistral)、Global+Local (Longformer)、BigBird
- **关键技术**：稀疏掩码$M \in \{0, -\infty\}$，只关注最近的$L$个token + 全局token
- **一句话总结**：不计算≈0的位置，省算力

**流派4：线性注意力（Linear Attention）**

核心思想：移除或近似Softmax函数，重构计算范式，从根本上降复杂度。

- **目标**：将复杂度从$O(n^2)$降到$O(n)$
- **代表方法**：Linear Transformer、Performer、Mamba/SSM、RWKV
- **关键技术**：核函数替代softmax：$\text{Attention} \approx \frac{\phi(Q)(\phi(K)^T V)}{\phi(Q)(\phi(K)^T \mathbf{1})}$，先算$K^T V$（$O(nd^2)$）
- **一句话总结**：算法层面的革命

**四大流派对比**：

| 流派 | 核心思想 | 复杂度 | 代表方法 | 适用场景 |
|------|---------|--------|---------|---------|
| 硬件高效 | 工程优化，榨干硬件 | $O(n^2)$（但更快） | FlashAttention | 训练+推理 |
| 紧凑 | KV Cache压缩 | $O(n^2)$（显存更小） | GQA, MLA | 推理 |
| 稀疏 | 只计算重要位置 | $O(n \cdot w)$ | Sliding Window | 长序列推理 |
| 线性 | 改变计算范式 | $O(n)$ | Mamba, RWKV | 超长序列 |

---

### 9. Self-Attention vs Cross-Attention

**Self-Attention（自注意力）**：
- Q、K、V来源于**同一输入序列**
- 捕捉输入内部的依赖关系：每个token关注序列中所有token
- 公式：$Q = XW_Q, K = XW_K, V = XW_V$
- 应用：Transformer Encoder、GPT的decoder（masked self-attention）

**Cross-Attention（交叉注意力）**：
- Q来源与K/V不同：Q来自当前层，K/V来自另一序列
- 实现跨模态/跨序列的信息交互
- 公式：$Q = XW_Q, K = YW_K, V = YW_V$（$X \neq Y$）
- 应用：Transformer Decoder（Q=decoder, K/V=encoder）、多模态模型

**对比表**：

| 维度 | Self-Attention | Cross-Attention |
|------|---------------|-----------------|
| QKV来源 | 同一输入 | Q≠KV |
| 目的 | 内部依赖建模 | 跨序列信息融合 |
| 典型场景 | GPT生成 | 翻译Decode、VLM多模态 |

---

### 10. Sparse Attention详解

**核心动机**：softmax后的attention矩阵天然稀疏。实验表明90%以上的attention权重集中在少数token上，计算大量≈0的位置是巨大浪费。

**Sliding Window Attention（Mistral）**：
- 每个token只关注前后$w$个token（局部窗口）
- 复杂度：$O(n \cdot w)$，$w$通常为4096
- 优点：简单高效，配合RoPE实现长度外推
- 缺点：无法关注远距离token

**Global + Local组合（Longformer, BigBird）**：
- 部分global token（如[CLS]）关注所有token
- 其余token使用sliding window
- 结合了局部精细+全局感知

**稀疏模式图示**：
$$
M_{ij} = \begin{cases}
0 & \text{if } |i-j| \leq w \text{ (local window)} \\
0 & \text{if token } j \text{ is global} \\
-\infty & \text{otherwise}
\end{cases}
$$

---

### 11. Linear Attention详解

**核心数学技巧**：改变乘法结合顺序。

标准Attention需要先算$QK^T$（$n \times n$），再乘$V$。但如果有办法分解softmax：

$$
\text{Attention}(Q,K,V) \approx \frac{\phi(Q)(\phi(K)^T V)}{\phi(Q)(\phi(K)^T \mathbf{1})}
$$

先算$\phi(K)^T V$（$d \times d$矩阵），再乘$\phi(Q)$，复杂度从$O(n^2 d)$降为$O(nd^2)$。

当$n \gg d$时（长序列场景），这是巨大的加速。

**代表性方法**：

**Performer（FAVOR+）**：
- 使用随机正交特征近似softmax
- $\phi(x) = \frac{1}{\sqrt{m}}[\sin(w_1^T x), \cos(w_1^T x), ..., \sin(w_m^T x), \cos(w_m^T x)]$
- 理论上可证明近似误差可控

**Mamba（Selective SSM）**：
- 使用State Space Model替代Attention
- 核心公式：$h_t = A_t h_{t-1} + B_t x_t, y_t = C_t h_t$
- $A_t, B_t, C_t$是输入的线性函数（Selective机制）
- 实现content-based reasoning
- 复杂度$O(n)$

**RWKV**：
- 结合RNN的高效推理和Transformer的并行训练
- 使用指数衰减的time-mixing机制

**Linear Attention的局限**：
- 精度通常不如标准Attention（尤其短序列）
- 缺乏精确的token-level lookup能力
- 在Recall-intensive任务上表现弱于Transformer

## 关键要点
- Scaled Dot-Product Attention = $\text{softmax}(QK^T/\sqrt{d_k})V$，除以$\sqrt{d_k}$防止梯度消失
- MHA：h个独立head，每个有独立Q/K/V投影，参数量$4d_{model}^2$
- MQA：所有head共享K/V，KV Cache压缩$h$倍，表达能力受损
- GQA：h个head分g组共享K/V，$g=8$是平衡点，LLaMA-2/3/Mistral均采用
- MLA：K/V压缩到低维latent($d_c \approx 128$)，KV Cache压缩10-40倍
- FlashAttention：Tiling+Online Softmax实现$O(n)$显存，2-4倍加速
- KV Cache计算公式：每层每token = 2 × n_kv_heads × d_head × sizeof(dtype)
- 推理Prefill阶段是Compute Bound，Decode阶段是Memory Bound
- 位置编码(RoPE)只作用于Q和K，不影响V
- GQA中attention mask和MHA完全一致，无需特殊处理
- 四大优化流派：硬件高效(FlashAttn)、紧凑(GQA/MLA)、稀疏(Sliding Window)、线性(Mamba)
- Self-Attention QKV同源，Cross-Attention Q≠KV
- 稀疏Attention复杂度$O(n \cdot w)$，线性Attention复杂度$O(nd^2)$
- Linear Attention先算$K^T V$改变乘法顺序，$n \gg d$时加速显著

## 自测问题

**Q1: Scaled Dot-Product Attention中为什么除以$\sqrt{d_k}$？不除会怎样？**

<details>
<summary>点击查看答案</summary>

除以$\sqrt{d_k}$是为了防止点积值过大导致softmax梯度消失。

**数学分析**：
- 假设q和k的每个分量独立同分布，均值为0，方差为1
- 则$q \cdot k = \sum_{i=1}^{d_k} q_i k_i$的方差为$d_k$
- 当$d_k$很大时（如128），点积值可能达到$\pm 10-20$
- softmax在大正值处输出接近1，梯度接近0
- softmax在大负值处输出接近0，梯度也接近0

**不除的结果**：
- 训练初期梯度消失，loss不下降
- Attention权重退化为one-hot（只有一个位置被关注）
- 模型无法学习有效的注意力分布

**解决方法**：
- 除以$\sqrt{d_k}$使方差归一化为1
- 或使用其他缩放方式（如除以$d_k$而非$\sqrt{d_k}$，但效果不如$\sqrt{d_k}$）
</details>

**Q2: MHA、MQA、GQA的区别？各自的参数量和KV Cache如何计算？**

<details>
<summary>点击查看答案</summary>

**参数对比**（设$d_{model}=4096, h=32, d_{head}=128, g=8$）：

| 机制 | Q投影 | K投影 | V投影 | O投影 | 总参数 |
|------|-------|-------|-------|-------|--------|
| MHA | $4096\times4096$ | $4096\times4096$ | $4096\times4096$ | $4096\times4096$ | $4\times 16.8M$ |
| MQA | $4096\times4096$ | $4096\times128$ | $4096\times128$ | $4096\times4096$ | $\sim 2.1\times 16.8M$ |
| GQA | $4096\times4096$ | $4096\times(128\times8)$ | $4096\times(128\times8)$ | $4096\times4096$ | $\sim 2.5\times 16.8M$ |

**KV Cache计算**（每层每token，FP16）：

- MHA: $2 \times h \times d_{head} \times 2\text{ bytes} = 2 \times 32 \times 128 \times 2 = 16\text{KB}$
- MQA: $2 \times 1 \times 128 \times 2 = 512\text{B}$（压缩32倍）
- GQA($g=8$): $2 \times 8 \times 128 \times 2 = 4\text{KB}$（压缩8倍）

**核心区别**：
- MHA：$h$个Q分别对应$h$个独立的K/V → 显存最大，表达最强
- MQA：$h$个Q共享1组K/V → 显存最小，表达受限
- GQA：$h$个Q分组共享$g$组K/V → 折中方案
</details>

**Q3: 为什么GQA是当前大模型推理的主流选择？$g$取多少合适？**

<details>
<summary>点击查看答案</summary>

**为什么GQA是主流**：

1. **显存效率**：KV Cache压缩$h/g$倍（通常8倍）。对于LLaMA-2 70B（80层，$h=64, g=8$），序列长度4096时KV Cache从$\sim 80\text{GB}$降到$\sim 10\text{GB}$
2. **效果无损**：Google实验表明$g=8$时perplexity几乎不变（变化$<0.1$），甚至在某些任务上略优于MHA（因为正则化效果）
3. **训练兼容**：训练时可以使用MHA（更好收敛），推理时转换为GQA（只需对K/V投影做mean pooling）
4. **生态支持**：vLLM、TensorRT-LLM、SGLang等推理框架都对GQA有专门优化

**$g$的取值建议**：
- $g=8$：最常用配置，LLaMA-2/3的默认值
- $g=4$：Mistral使用，KV Cache压缩8倍，效果损失极小
- $g=1$（即MQA）：PaLM使用，KV Cache压缩32倍，但有可感知的效果下降
- $g=h$（即MHA）：训练时使用，推理转换时设$g=8$

**upsample技巧**：训练时用MHA($g=h$)，推理时用GQA($g=8$)。对K/V的h个head做mean pooling合并成g组。Google实验：mean pooling比learning from scratch效果更好！
</details>

**Q4: MLA如何做到比GQA更极致的KV压缩？核心insight是什么？**

<details>
<summary>点击查看答案</summary>

**MLA的核心insight**：K和V的信息冗余度远高于Q。Q需要丰富的表达能力来区分不同的attention pattern，而K和V主要提供被查询的信息，可以用低维表示。

**压缩原理**：

1. **低秩假设**：实际有效的K/V信息秩远小于$h \times d_{head}$
2. **Down-Projection**：$c_{KV} = W_{down} \cdot h$，将hidden state(5120维)压缩到latent(128维)
3. **推理只存latent**：$c_{KV}$只有128维，远小于展开后的K(5120维)
4. **Attention计算优化**：$Q(W_{uk}c_{KV})^T = (QW_{uk}^T)c_{KV}^T$，避免展开

**压缩比对比**：
- GQA($g=8$): 压缩8倍
- MLA($d_c=128$): 压缩$5120/128 \approx 40$倍

**为什么低秩假设有效**：
- 类似LoRA的思想：模型权重中的信息秩远小于矩阵维度
- K和V的投影矩阵可以通过SVD发现高度低秩
- Up-projection网络学习如何在需要时从latent中恢复关键信息
- 实验验证：$d_c=128$时perplexity与full KV Cache几乎一致

**MLA的代价**：
- 额外的down-projection和up-projection计算（约增加5%FLOPs）
- 训练时需要存储完整K/V（因为反向传播需要）
- 需要特殊的RoPE兼容处理
</details>

**Q5: KV Cache的计算公式是什么？LLaMA-7B在序列长度4096时KV Cache占多少显存？**

<details>
<summary>点击查看答案</summary>

**KV Cache显存计算公式**：

$$
\text{KV Cache (bytes)} = 2 \times n_{layers} \times n_{kv\_heads} \times d_{head} \times n_{tokens} \times \text{sizeof(dtype)}
$$

**LLaMA-7B计算**（$L=32, h=32, d_{head}=128, n=4096, \text{FP16}$）：
- MHA: $2 \times 32 \times 32 \times 128 \times 4096 \times 2 = 2.0\text{GB}$
- GQA($g=8$): $2 \times 32 \times 8 \times 128 \times 4096 \times 2 = 0.5\text{GB}$

**LLaMA-70B计算**（$L=80, h=64, g=8, d_{head}=128$）：
- GQA($g=8$): $2 \times 80 \times 8 \times 128 \times 4096 \times 2 = 1.25\text{GB}$

**总显存** = 模型权重 + KV Cache + 激活值：
- LLaMA-7B FP16权重：$\sim 14\text{GB}$
- 总显存（batch=1）：$14 + 2.0 + 0.5 \approx 16.5\text{GB}$（A10刚好装下）

**面试要点**：能现场手算显存，区分MHA/GQA/MLA的KV Cache大小。
</details>

**Q6: FlashAttention为什么快？Tiling策略如何工作？**

<details>
<summary>点击查看答案</summary>

**FlashAttention的核心创新**：IO-Awareness——知道Attention的计算瓶颈在显存带宽而非算力，重新设计计算顺序来减少HBM读写。

**HBM vs SRAM**：
- HBM（高带宽显存）：容量大（80GB A100），带宽1.5-2TB/s
- SRAM（芯片内缓存）：容量小（20MB A100），带宽19TB/s（快10倍）
- Standard Attention反复读写$n \times n$矩阵到HBM → IO瓶颈

**Tiling策略**（三步）：

1. **分块加载**：将Q、K、V切成块，每次只加载一个块到SRAM
2. **Online Softmax**：在块内增量计算softmax，不存储完整$n \times n$矩阵：
   - 维护running max($m$)和running sum($\ell$)
   - 新块到来时更新：$m_{new} = \max(m_{old}, m_{block})$
   - $\ell_{new} = e^{m_{old}-m_{new}} \cdot \ell_{old} + \sum e^{x_{block}-m_{new}}$
3. **Recomputation**：反向传播时重新计算attention矩阵（而非从HBM读取）

**速度提升**：
- 训练：2-4倍加速
- 显存：从$O(n^2)$降到$O(n)$
- 数学等价：输出与Standard Attention完全一致

**FlashAttention V2/V3的改进**：
- V2：更好的work partitioning，减少非矩阵乘法操作
- V3：支持FP8，Hopper架构异步拷贝
</details>

**Q7: Prefill和Decode阶段的Attention计算有什么不同？**

<details>
<summary>点击查看答案</summary>

**Prefill阶段**（Compute Bound）：
- 输入：完整的prompt tokens（如1024个token）
- 计算：$Q_{1024}K_{1024}^T$得到$1024 \times 1024$的attention矩阵
- 瓶颈：GPU算力（FLOPS）——需要计算大量矩阵乘法
- KV Cache：计算后存入，无历史KV Cache
- 优化：FlashAttention（减少IO）、大batch

**Decode阶段**（Memory Bound）：
- 输入：1个新token
- 计算：$Q_{1}K_{1+1024}^T$，只需要计算新token与所有历史token的attention
- 瓶颈：显存带宽——需要从HBM读取1+1024个K/V
- KV Cache：读取历史KV Cache + 追加新token的KV
- 优化：GQA/MQA/MLA（减少KV Cache大小）、PagedAttention

**核心区别**：
| 维度 | Prefill | Decode |
|------|---------|--------|
| 计算量 | $O(n^2 \cdot d)$ | $O(n \cdot d)$ |
| 瓶颈 | Compute | Memory |
| KV Cache | 新建 | 读取+追加 |
| 优化方向 | FlashAttention | GQA/MLA/KV量化 |
| 指标 | TTFT | TPOT / Throughput |
</details>

**Q8: 为什么现在大模型用GQA而不直接用MHA？训练时用MHA推理转GQA怎么做？**

<details>
<summary>点击查看答案</summary>

**为什么不用MHA**：推理阶段的KV Cache太大，显存成为瓶颈。在batch serving场景下（同时服务多个请求），KV Cache是显存占用的主要来源。

**训练MHA→推理GQA的转换方法**：

**方法1：Mean Pooling（Google推荐）**
```python
# 将h个K head合并为g组
def mha_to_gqa(k_proj_weight, h=32, g=8):
    # k_proj_weight: (h*d_head, d_model)
    # 每组h/g个head做mean pooling
    heads_per_group = h // g
    new_weight = k_proj_weight.reshape(g, heads_per_group, d_head, d_model)
    return new_weight.mean(dim=1).reshape(g*d_head, d_model)
```

**方法2：直接训练GQA**
- LLaMA-2/3直接在预训练中使用GQA
- 从头训练，不需要转换

**为什么Mean Pooling有效**：
- Google实验验证，MHA→GQA转换的perplexity变化<0.05
- 远优于随机初始化K/V投影
- 甚至可以比从头训练GQA更好（因为利用了MHA训练的丰富表示）
</details>

**Q9: Attention四大优化流派分别是什么？各解决了什么问题？如何选型？**

<details>
<summary>点击查看答案</summary>

**四大流派选型指南**：

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 标准长度训练（<8K） | FlashAttention | 工程加速，精度无损 |
| 标准长度推理（<8K） | FlashAttn + GQA | 推理显存优化 |
| 中等长序列（8K-32K） | GQA + Sliding Window | 局部注意+压缩KV |
| 超长序列（>100K） | Mamba/Linear Attn | $O(n)$复杂度，内存线性增长 |
| 极致推理吞吐 | GQA + MLA + FP8 KV | 组合优化，DeepSeek方案 |
</details>

**Q10: Self-Attention和Cross-Attention的区别？什么时候用哪个？**

<details>
<summary>点击查看答案</summary>

**Self-Attention**：Q、K、V来自同一输入。例如GPT中每个token看之前所有token（causal self-attention）。

**Cross-Attention**：Q来自当前层，K/V来自另一序列。例如翻译模型中Decoder的Q关注Encoder输出的K/V。

**应用场景**：
- Self-Attention：所有GPT类模型、BERT的encoder
- Cross-Attention：Encoder-Decoder模型（T5、翻译）、多模态模型（CLIP的视觉-语言交互）、Stable Diffusion（text→image的cross-attn）

**面试要点**：能区分两种attention的数据流方向，能举出实际模型例子。
</details>

**Q11: Sparse Attention中的Sliding Window如何工作？为什么Mistral选择它？**

<details>
<summary>点击查看答案</summary>

Sliding Window Attention让每个token只关注前后$w$个token（通常$w=4096$）。

**为什么有效**：语言中局部依赖最重要。实验表明绝大多数语义关系在距离<1000 token内。

**Mistral的选择理由**：
1. 简单：实现只需在attention mask中加一个band
2. 高效：复杂度$O(n \cdot w)$而非$O(n^2)$
3. 配合RoPE：可以通过NTK/YaRN外推到训练时未见过的长度
4. 效果：Mistral-7B在大多数benchmark上优于LLaMA-2 13B

**Sliding Window的关键参数**：
- $w=4096$ (Mistral)：每个token看前后4096个token
- $w=512$ (Longformer)：用于长文档任务
- 结合global tokens：一些特殊token（如[CLS]）不受窗口限制
</details>

**Q12: Linear Attention的数学原理？为什么可以改变乘法顺序？对精度有什么影响？**

<details>
<summary>点击查看答案</summary>

**核心技巧**：用核函数$\phi$近似softmax。

标准Attention无法改变顺序因为softmax的非线性：
$$\text{Attention} = \text{softmax}(QK^T)V$$

Linear Attention用$\phi(Q)\phi(K)^T$近似$\text{softmax}(QK^T)$：
$$\text{Attention} \approx \frac{\phi(Q)(\phi(K)^T V)}{\phi(Q)(\phi(K)^T \mathbf{1})}$$

**改变顺序的效果**：
- 先算$\phi(K)^T V$：$d \times d$矩阵（$O(nd^2)$）
- 再乘$\phi(Q)$：$n \times d$（$O(nd^2)$）
- 总复杂度$O(nd^2)$ vs 标准$O(n^2 d)$
- 当$n \gg d$时加速显著（如$n=128K, d=64$，加速1000倍）

**精度影响**：
- $\phi$的近似精度决定最终效果
- Performer用随机特征近似，理论上可证明误差可控
- 实际应用中召回类任务（needle-in-haystack）弱于标准Attention
- 适合：长序列分类、摘要
- 不适合：精确token-level检索
</details>

## 图片

![Attention四大流派](http://sns-webpic-qc.xhscdn.com/202606232209/b7c700f900cfc7d18a256a5e45dfbfc7/spectrum/1040g34o31mfu61mg4s005oa7tjh0k497987kd7o!nd_dft_wlteh_webp_3)
*Attention四大优化流派全景图*

![MHA vs MQA vs GQA 对比图](http://sns-webpic-qc.xhscdn.com/202606222256/75157530ea33be96bb66eaa23afb6eb1/spectrum/1040g0k031qklje3ogm0040to5t11l9rtq78eg1o!nc_n_webp_mw_1)
*MHA vs MQA vs GQA 对比图*

![Compact Attention](http://sns-webpic-qc.xhscdn.com/202606232209/835ad8af597c79ca90009815c3a145c6/spectrum/1040g34o31mfu61mg4s105oa7tjh0k497b8fs30o!nd_dft_wlteh_webp_3)
*紧凑注意力（GQA/MLA）原理图*

![Sparse Attention](http://sns-webpic-qc.xhscdn.com/202606232209/e391e20900b27dbb7eafd0834499176a/spectrum/1040g34o31mfu61mg4s1g5oa7tjh0k497deud3dg!nd_dft_wlteh_webp_3)
*稀疏注意力原理图*

## 相关笔记
- [[fnd-week01-transformer-block]]
- [[qa-week01-attn-complexity]]
- [[fnd-week10-kv-cache]]
- [[qa-week03-deepseek-mla]]
