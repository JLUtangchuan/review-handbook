---
title: "论文阅读-具身智能: Diffusion-VLA, OmniManip, FAST, SpatialVLA"
author: "lumosity"
source_url: https://zhuanlan.zhihu.com/p/22021457305
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 论文阅读-具身智能: Diffusion-VLA, OmniManip, FAST, SpatialVLA

> 作者: lumosity | 来源: https://zhuanlan.zhihu.com/p/22021457305

---

本周的几篇论文，可以看出在机器人领域，也逐渐开始细粒度化优化。现有的VLA方法通常基于diffusion或基于autoregressive，但各有优劣，其中自回归方法可以更好地利用VLM的复杂任务的逻辑推理和规划能力，但需要将连续的动作生成离散化，且推理较慢，而扩散方法生成效果和速度更好，但只将VLM作为特征提取器没有很好的利用，下面的几篇方法均在某些层面上进行改进。Diffusion-VLA希望将逻辑推理能力引导到动作生成，SpatialVLA引入更细粒度的3D信息，同时FAST和SpatialVLA都探索了自回归的VLA对tokenizer的优化加速，而OmniManip可以称为加强版本的ReKep，更细粒度更系统的优化整个处理流程。

Diffusion-VLA
基于diffusion的VLA模型，引入reasoning injection module将推理能力集成到diffusion的生成过程中。

基于自回归模型的VLA其逻辑推理能力更好，但连续动作空间离散化可能导致动作生成的连贯性及精度，且自回归的推理速度较慢；基于扩散模型的VLA其生成效果更好且推理采样速度更快，但缺乏对复杂任务的逻辑推理能力。故DiVLA希望结合两者的优点，如下图所示，VLM提供文本推理，Diffusion model学习机器人动作，为了弥合特征空间之间的隐含差异，引入reasoning injection module，显式地引导提升动作生成过程。

DiVLA基于预训练的Qwen2-VL，对于不同视角的视觉输入，共享SigLIP visual backbone提取特征然后进行concat；动作生成模型则使用随机初始化的standard Diffusion Policy，将text/image token作为条件进行生成，在最后一层增加MLP layer作为动作预测，对于不同的下游任务，则使用linear probing仅训练MLP层即可。此外，传统的CoT递归生成较慢，故引入reasoning injection module，直接对diffusion policy注入推理信号，即将推理组件输出中最后的embedding通过特征线性调制FiLM（其实类似以前风格迁移的AdaIN，只是输入特征和条件特征换成了视觉和文本特征）去辅助增强动作生成。

训练时，使用Droid数据集作为DiVLA-2B和DiVLA-7B的预训练数据，对于DiVLA-72B则额外增加OXE数据，且利用GPT-4o为Droid数据增加推理形式。此外，为了控制因为视图数量增加导致的visual token过多，通过将wrist camera views显著减小到16；最终训练损失为：\mathcal{L} = \mathcal{L}_{\text{diffusion}} + \alpha \mathcal{L}_{\text{ntp}}。

OmniManip
可不可以称为更强和更细化的ReKep

在机器人领域利用VLM，其擅于进行high-level的任务规划，但缺乏精细且low-level的3D空间理解能力。常见的解决方式是使用大规模的机器人数据集对VLM进行微调，但挑战是多样化且高质量的数据，以及泛化能力，故希望将机器人动作抽象为interaction primitives(感觉前文的ICRT, ReKep，甚至LAPA都可以属于这一类，希望获得通用的primitives)，并利用VLM的推理能力去定义primitives的空间约束(感觉类似ICRT的motion primitives + object)，去桥接VLM高层次的任务规划能力及机器人操纵所需的低层次的精细理解能力。

故OmniManip提出object-centric intermediate representation，将VLM的常识推理转换为3D空间约束（其实就是像ReKep，用更结构化和更语义丰富度的方式进行约束，如交互点和方向信息等，同样无需微调VLM）。具体而言，使用Omni6dpose模型对object进行规划化并描述其刚性变化，并使用单视图的3D生成网络生成详细的object meshes；在这个规范化的空间中，交互方向沿object的主轴采样获得初始采样集合，而VLM用于预测交互点，然后识别与任务相关的primitives并估计空间约束；此外，为了降低推理的幻觉，引入interaction rendering和primitive resampling的自校正机制。之后，则优化带空间约束的动作生成，并使用姿态跟踪保证动作执行阶段的实时控制。

如上图所示，对于输入的instruction和RGB-D图像，VLM筛选出与任务相关的对象，并对任务分解为多个阶段；在每个阶段，VLM以闭环的方式提取object-centric的interaction primitives作为空间约束；在执行时，则进行约束优化生成动作轨迹，并通过6d pose tracker闭环保证控制效果。

Manipulation with Interaction Primitives：

Task Decomposition：利用GroundingDINO和SAM标记前景目标，利用GPT-4o过滤出与任务相关的object并对任务分解为多个阶段，每个阶段形式化表示为：\mathcal{S}_i = \{A_i, \mathcal{O}_i^{\text{active}}, \mathcal{O}_i^{\text{passive}}\}，其中A_i表示执行的action，\mathcal{O}_i^{\text{active}}, \mathcal{O}_i^{\text{passive}}分别表示该动作交互的发起和接收对象；
Object-Centric Canonical Interaction Primitives：通过object的交互点\mathbf{p} \in \mathbb{R}^3和方向\mathbf{v} \in \mathbb{R}^3描述object's interaction primitives\mathcal{O}=\{\mathbf{p}, \mathbf{v}\}；
Interaction Primitives with Spatial Constraints：空间约束则描述active object和passive object之间的关系，分为距离约束d_i和角度约束\theta_i，故完整的空间约束为\mathcal{C}_i = \{\mathcal{O}_i^{\text{active}}, \mathcal{O}_i^{\text{passive}}, d_i, \theta_i\}。




Primitives and Constraints Extraction：首先通过单视图3D生成模型为active object和passive object生成3D object mesh，再使用Omni6DPose进行姿态估计以获得object的规范化空间，然后提取与任务相关的interaction primitives和spatial constraints。

Grounding Interaction Point：如图所示，交互点可分为visible/tangible或invisible/intangible，为了VLM更好地提取grounding interaction point，则采用SCAFFOLD视觉提示将Cartesian grid叠加到输入图像上；visible交互点则直接在原图定位，而invisible交互点需要多视图推理，此外对于grasp等任务则通过多交互点生成热图，提高鲁棒性；





Sampling Interaction Direction：通常object的主轴和实现的功能有关，如图所示，将主轴作为候选的交互方向，并使用VLM生成每个候选轴的语义描述，然后使用LLM对描述和任务的相关性打分，由此对不同的方向进行排序。





最后使用VLM为每个阶段生成有序的带约束的interaction primitives，即K_i = \{C_i^{(1)}, \cdots, C_i^{(N)}\}。

Dual Closed-Loop System：为了克服前面模型推理的幻觉，及执行环境的动态性等挑战，分别进一步引入相应的纠错或干预流程以实现闭环处理。

Closed-loop Planning：为了提高interaction primitives的准确性和降低VLM的幻觉，引入Resampling, Rendering, and Checking (RRC)机制，如图所示，其实都是prompt上的工作，结合VLM的反馈优化生成。





Closed-loop Execution：带约束的优化目标如下，以确定末端执行器的目标姿态\mathbf{P}^{\text{ee*}}：
\begin{aligned} & \mathbf{P}^{\text{ee*}} = \arg \min_{\mathbf{P}^{\text{ee}}} \{\sum_{j=1}^N \mathcal{L}_j (\mathbf{P}^{\text{ee}})\}, \quad \mathcal{L} = \{\mathcal{L}_C, \mathcal{L}_{\text{collision}}, \mathcal{L}_{\text{path}}\} \\ & \mathcal{L}_C = \rho(C, \mathbf{P}_t^{\text{active}}, \mathbf{P}_t^{\text{passive}}), \quad \text{where} \quad \mathbf{P}_t^{\text{active}} = \Phi(\mathbf{P}_t^{\text{ee}}) \\ & \mathcal{L}_{\text{collision}} = \sum_{j=1}^{N} \max(0, d_{\text{min}} - d(\mathbf{P}^{\text{ee}}, \mathbf{O}_j))^2 \\ & \mathcal{L}_{\text{path}} = \lambda_1 d_{\text{trans}}(\mathbf{P}_t^{\text{ee}}, \mathbf{P}^{\text{ee}}) + \lambda_2 d_{\text{rot}}(\mathbf{P}_t^{\text{ee}}, \mathbf{P}^{\text{ee}}) \end{aligned} \\其中，\mathcal{L}_C确保action符合空间约束，通过最小化active object和passive object的当前空间关系与约束C之间的偏差，\Phi(\cdot)则用于将末端执行器的姿态映射到active object的姿态；\mathcal{L}_{\text{collision}}则防止末端执行器与环境中的障碍物碰撞，d(\cdot)表示末端执行器和障碍物\mathbf{O}_j之间的距离，d_\text{min}表示允许的最小安全距离；\mathcal{L}_{\text{path}}确保运动的稳定性，通过动态调整末端执行器的姿态\mathbf{P}^{\text{ee}}去确保任务执行成功。
此外，为了应对意外或动态环境，直接使用现成的6D目标姿态跟踪算法实时更新active object和passive object的姿态，从而动态调整优化末端执行器的目标姿态，以实现更鲁棒和精确的执行。




FAST
基于自回归的VLA模型，为了高频数据训练拟合，新提出一种tokenizer，主要采用DCT + BPE。

对于自回归的VLA模型，需要将模型预测的离散token映射为连续action，现有方法通过简单的按维度和时间步的分组导致其高频数据的泛化性不好，收敛也更难（大致是因为对于高频数据，时间步之间的变化太小，边际效应递减，模型可以选择复制相邻的token偷懒以实现较小的损失而不是根据context学习next token prediction）。

故本文提出Frequency-space Action Sequence Tokenization (FAST)方法，需要对action signal进行压缩减少连续token之间的相关性。如下图所示，FAST对input action按动作维度归一化为[-1, 1]，并应用discrete cosine transform (DCT)将信号转换为频域，然后通过scale（作为超参平衡压缩率和量化损失）和round量化为稀疏矩阵，并通过byte-pair encoding (BPE)进一步无损压缩为最终dense的action token。

notice：1）稀疏矩阵按列展开，即低频分量在前；2）超参不敏感，设置量化时的scale=10，BPE时的vocab_size=1024。

此外，本文通过大概100w个1-second action chunks数据训练通用的tokenizer，并可通过huggingface应用或训练，即：

from transformers import AutoProcessor

tokenizer = AutoProcessor.from_pretrained("physical-intelligence/fast", trust_remote_code=True)
# apply to robot action chunk
tokens = tokenizer(action_chunk)
# train new FAST tokenizer
new_tokenizer = tokenizer.fit(action_dataset)


实验则基于\pi_0的PaliGemma-3B和OpenVLA的Prismatic 7B进行训练，并用FAST进行tokenize，按照先前方法替换VLM中使用频率最低的vocab，然后不冻结，直接微调VLA。效果上基本持平，\pi_0-\text{VLA}训练收敛速度比\pi_0快3-5倍，推理时耗时增加约7.5倍（更多的decoding steps，更大的backbone for decoding）。

SpatialVLA
基于自回归的VLA模型，为了引入3D信息，采用Ego3D Position Encoding和Adaptive Action Grids（类似tokenizer进行离散-连续的动作空间之间的编码解码，但很多细节不太懂）

现有的VLA模型仅使用二维的observation输入，缺乏3D精确感知和理解，基于机器人观测的非对齐性和动作特性的异构性等挑战，本文提出SpatialVLA捕获和学习3D空间信息，即在VLA的输入中引入Ego3D Position Encoding，并使用Adaptive Action Grids预测离散的action token。

如上图所示，SpatialVLA属于自回归的VLA，其基于预训练的VLM，ego3D position encoding旨在根据3D空间信息和2D语义特征去提取3D场景结构，adaptive action grids旨在通过离散的spatial action token表示连续的robot action分布。

Ego3D Position Encoding：
旨在消除对相机的外部校准的需求，即通过ZoeDepth估计depth map，并通过相机内参反向投影到3D点云，计算每个sub-patch的平均高频点云编码，通过正弦函数和MLP映射到SigLIP提取的2D image patch维度，然后相加作为输入。
Adaptive Action Grids：
其作用类似tokenizer，将动作空间编码为具有高斯分布的action grid，以及对grid解码成action token。具体而言，对于单臂机器人，action划分为translation, rotation, gripper，分别对应\mathbf{a} = \{\mathbf{a}_{\text{trans}} = \{x,y,z\} = \{\phi, \theta, r\}, \mathbf{a}_{\text{rot}} = \text{\{roll, pitch, yaw\}}, \mathbf{a}_{\text{grip}} = \{\text{grip}\}\}。


则将连续的translation/rotation动作变量归一化到[-1,1]，再计算每个变量在整个数据集的累积概率密度，要求其遵循高斯分布，并划分为具有相等概率的多段（对于不同变量，其数量不一致，假设\mathbf{M}_{\phi}, \mathbf{M}_{\theta}, \mathbf{M}_{r}, \mathbf{M}_{\text{roll}}, \mathbf{M}_{\text{pitch}}, \mathbf{M}_{\text{yaw}}表示对应划分的数量，则表示\mathbf{a}_{\text{trans}}被划分为\{\mathbf{a}^1, \cdots, \mathbf{a}^{\mathbf{M}_{\text{trans}}}\}，其中\mathbf{M}_{\text{trans}} = \mathbf{M}_{\phi} \cdot \mathbf{M}_{\theta} \cdot \mathbf{M}_{r}），最终可学习的spatial action token embedding为：
\mathbf{E}_{\mathbf{a}} = \{\mathbf{E}_{\text{trans}}, \mathbf{E}_{\text{rot}}, \mathbf{E}_{\text{grip}}\} \\对应的vocab大小为V = \mathbf{M}_{\text{trans}} + \mathbf{M}_{\text{rot}} + 2 = 8194，其与LLM embedding拼接作为输入。

同样，对于训练阶段，SpatialVLA包含pretrain + posttrain：

pretrain：使用OXE, RH20T混合数据集进行训练，且DROID数据集用于预训练的annealing阶段提升模型能力，训练时text embedding被冻结以保持指令遵循等能力，训练目标为预测action的交叉熵损失：
\mathcal{L}(\theta) = \mathbb{E}_{p(\mathbf{A}_t \mid \mathbf{o}_t)} \mathcal{L}(\mathbf{a}_t, \tilde{\mathbf{a}}_t) \\
posttrain：通过spatial embedding adaption方法引入spatial action tokenizer，即对每个训练数据集为每个动作变量拟合一个高斯分布\mathcal{N}(\mu_{\text{new}}, \Sigma_{\text{new}})，并获得离散的action grids\mathbf{G}_{\text{new}}和action token\mathbf{a}_{\text{new}}，spatial action token embedding\mathbf{E}_\mathbf{a_{\text{new}}}则由预训练的action tokens\mathbf{E}_\mathbf{a}通过三线性插值初始化，以将预训练的动作空间迁移到新的机器人设置中，然后同样使用next token prediction进行训练。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-d58173aac3ea5d0534239cc77e5c3bf1_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic4.zhimg.com/v2-15d7e339a27b2e32ea623d2bbaee37d5_1440w.jpg)

![图片](https://pica.zhimg.com/v2-75fc452696d7971696886b74df8fe7e2_1440w.jpg)

![图片](https://picx.zhimg.com/v2-e629ca0d8ca82bfaf6e3ae547a130761_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-0c331d4b3fb122f6f4e28a2ac26be8bd_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-570bd76d83bcbe3e12f95788cea432c2_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-9f57201fe13f10bbac2d30889e705444_1440w.jpg)

![图片](https://picx.zhimg.com/v2-76f3074a616787af480844b32551b167_1440w.jpg)

![图片](https://pica.zhimg.com/v2-4d029dbc5635f612cd847398c0b24ab4_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-9ec576b343d191e19fa7f53fb1566fa9_1440w.jpg)

![图片](https://pica.zhimg.com/v2-94d4ab94ee6c224cdf99dc6a5b72e990_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-85e434aa20952ca4ec6ff3e3a88704a0_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-65b251269219b33bc6a6340781b6d730_1440w.jpg)

![图片](https://picx.zhimg.com/v2-e4aeda80fb1969eb9d03f96d710cd39d_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-d0d2d36ffd962ea93cead510e684e308_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-a675c5c4f39cd6c6a3358827b48f53c7_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-dfdece40dd07031737990395c1ca5066_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-d58173aac3ea5d0534239cc77e5c3bf1_l.jpg?source=172ae18b)

