---
title: "百面LLM-97"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1950510390044762428
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-97

> @swtheking | https://zhuanlan.zhihu.com/p/1950510390044762428

---

提问：什么是 Prefill-Decode 分离？

回答：在传统的 LLM 推理框架中，Prefill 和 Decode 阶段通常由同一块 GPU 执行。推理引擎的调度器会根据显存使用情况及请求队列状态，在 Prefill 和 Decode 之间切换，完成整个推理过程。

而在 Prefill-Decode 分离式架构（以下简称 PD 分离式架构）中，这两个阶段被拆分到不同的 GPU 实例上独立运行。

具体而言：

Prefill 阶段

功能：处理输入的prompt/上下文；特点：1. 计算密集型（compute-bound）2. 并行处理所有输入token

3. 需要大量计算资源 4. 延迟相对固定

Decode 阶段

功能：逐个生成输出token； 特点：1. 内存带宽密集型（memory-bound）2. 串行生成，每次生成一个token

3. 需要频繁访问KV缓存 4. 延迟随生成长度增加

分离的优势

Prefill集群：高计算能力 + 相对较少内存

Decode集群：高内存带宽 + 相对较少计算单元

并发处理：prefill和decode可同时进行
专门优化：每个阶段使用最适合的硬件和算法
减少排队：避免两种不同workload互相干扰

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic2.zhimg.com/v2-9bc899c5c9136a7d83cbc05983a7d210_bh.webp?source=d6434cab)

![图](https://pic2.zhimg.com/v2-ecaf7d53d6e1173d0b311c482bf37681_xl.webp?source=d6434cab)

