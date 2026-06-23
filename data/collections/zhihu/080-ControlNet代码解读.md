---
title: "ControlNet代码解读"
author: "鳄鱼家的帅气猪"
source_url: https://zhuanlan.zhihu.com/p/674823587
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# ControlNet代码解读

> 作者: 鳄鱼家的帅气猪 | 来源: https://zhuanlan.zhihu.com/p/674823587

---

续命

，可能有人在想这个东西有什么用呢，难道就是一股脑生成一堆图片吗？任何算法都必须为解决问题而生，这点没有人否认吧。回故一下扩散模型是通过训练去噪过程，然后利用上篇文章得公式进行推理。

想想应用，扩散模型想不到应用是因为生成图片是乱的，如果我们可以控制他如何生成这不就有应用了吗，这也就是过去很火的SD，这篇文章就介绍条件生成的代码详情，实现逻辑。

有关于DDIM和条件生成的可以参考苏神的总结：




ControlNet代码 ：https://github.com/lllyasviel/ControlNet

这个代码相信很多人都看过，如果你经常混迹于各大模型的复现，可能觉得没啥。但是如果你是看见SD的效果，想来看看代码的小白，我觉得你会说一句卧槽牛皮，因为看完把自己绕进去了。想想以前大家卷模型代码，要么用框架（mmseg等），要么自己写个，数据加载、数据增强、然后epoch循环等，像yolo以前那样。基本上模型结构文件也就一层或者两层，各大模块都比较清晰。但是今天大模型的到来，注定无法短时间像以前那样干净简洁，包括了很多多模态的代码，没关系那么就带着一份学习的心态看看这块的代码。

首先我们来看看官方的图：

ControlNet




左边为原始的网络，右边为ControlNet，注意图b中x是加在第一个zero_conv后面的。这个图看起来很好懂，但是代码里面绝非描述的这样直观。下面还有个全局图：

图1

这个图实际上很清楚了，但是有些地方确实不好画，所以可能看起来费劲。左边的解码部分在训练中一直被冻结的，而且可以发现controlnet那边是有condition的，这个condition就是边缘合作分割图、深度图等。并且controlnet的编码部分是从左边SD拷贝过去的，每一层在前面有个zero_conv，屁股后面还有一个zero_conv，controlnet下面的变大的zero可不是解码啊，他没有解码的。它的解码实际上是借的SD家里的，所以最后才可以微调的。

虽然图看懂了，但是不代表代码也好看，代码里面的模块命名和这个图上面可不一样。




在介绍细节之前先了解下代码的大致流程:

类的继承 ControlLDM--->LatentDiffusion--->DDPM

调用 DDPM.training_step--->ControlLDM.get_input--->LatentDiffusion.get_input--->LatentDiffusion.forward--->LatentDiffusion.p_losses




接下来我用我拙略的画工，根据代码里面的模块命名画个流程图，如下：




ControlNet




这里开始会夹杂着代码进行解释：

图像预处理

1、AutoencoderKL

这个是个编码模块，对图像进行压缩，采用这个方法可以加速图像的生成，这个是提前训练好的。具体怎么做的这里不介绍，可自行查阅。

first_stage_config:
      target: ldm.models.autoencoder.AutoencoderKL
      params:
        embed_dim: 4
        monitor: val/rec_loss
        ddconfig:
          double_z: true
          z_channels: 4
          resolution: 256
          in_channels: 3
          out_ch: 3
          ch: 128
          ch_mult:
          - 1
          - 2
          - 4
          - 4
          num_res_blocks: 2
          attn_resolutions: []
          dropout: 0.0
        lossconfig:
          target: torch.nn.Identity


在LatentDiffusion中初始化时已经被固定

def instantiate_first_stage(self, config):
    model = instantiate_from_config(config)
    self.first_stage_model = model.eval()
    self.first_stage_model.train = disabled_train
    for param in self.first_stage_model.parameters():
        param.requires_grad = False

原始维度是3x512x512，编码后为4x64x64，实际上我们可以试一试它带的解码，实际上在输出的log里面是有的

log["reconstruction"] = self.decode_first_stage(z)

可以恢复是不是很诧异，看看解码的代码，路径为ldm\modules\diffusionmodules\model.py中的Decoder：

def forward(self, z):
    #assert z.shape[1:] == self.z_shape[1:]
    self.last_z_shape = z.shape

    # timestep embedding
    temb = None

    # z to block_in
    h = self.conv_in(z)

    # middle
    h = self.mid.block_1(h, temb)
    h = self.mid.attn_1(h)
    h = self.mid.block_2(h, temb)

    # upsampling
    for i_level in reversed(range(self.num_resolutions)):
        for i_block in range(self.num_res_blocks+1):
            h = self.up[i_level].block[i_block](h, temb)
            if len(self.up[i_level].attn) > 0:
                h = self.up[i_level].attn[i_block](h)
        if i_level != 0:
            h = self.up[i_level].upsample(h)

    # end
    if self.give_pre_end:
        return h

    h = self.norm_out(h)
    h = nonlinearity(h)
    h = self.conv_out(h)
    if self.tanh_out:
        h = torch.tanh(h)
    return h

说到这里得聊聊分辨率的损耗，在很多同学最开始都认为卷积下采样会导致信息损耗，这个观点似乎根深蒂固一样。那么实际上对于图像来说很多信息都是冗余的，在swin里面下采样时将空间分辨率储存到通道，或者直接卷积下采样已经成为了现在模型的不成文规定。骨干都是从1/4开始，vit也没有用多层，sam解码也可以很贴边。这个4x64x64的分辨率也说明了一点，只不过这个颠覆了很多人的想法。

你以为这里直接4通道吗，实际上也有细节的

class DiagonalGaussianDistribution(object):
    def __init__(self, parameters, deterministic=False):
        self.parameters = parameters
        self.mean, self.logvar = torch.chunk(parameters, 2, dim=1)
        self.logvar = torch.clamp(self.logvar, -30.0, 20.0)
        self.deterministic = deterministic
        self.std = torch.exp(0.5 * self.logvar)
        self.var = torch.exp(self.logvar)
        if self.deterministic:
            self.var = self.std = torch.zeros_like(self.mean).to(device=self.parameters.device)

    def sample(self):
        x = self.mean + self.std * torch.randn(self.mean.shape).to(device=self.parameters.device)
        # x = self.mean
        return x

parameters就是8通道的编码结果。

条件预处理

这里我们暂且认为条件有三种，时间、文字、边缘（可能是其他）

文字：通过FrozenCLIPEmbedder编码，维度为768

时间：通过timestep_embedding编码

边缘：无编码

dict(c_crossattn=[c], c_concat=[control])

c_crossattn为文字特征

c_concat为边缘特征




control_model

上图的input_hint_block就为control_model中的一个模块，负责融合条件的，代码如下：

    def forward(self, x, hint, timesteps, context, **kwargs):
        t_emb = timestep_embedding(timesteps, self.model_channels, repeat_only=False)
        emb = self.time_embed(t_emb)
        guided_hint = self.input_hint_block(hint, emb, context)  # 第一个zero,输出条件的的编码

        outs = []

        h = x.type(self.dtype)
        for module, zero_conv in zip(self.input_blocks, self.zero_convs):
            if guided_hint is not None:
                h = module(h, emb, context) 
                h += guided_hint  # 第一个module比较特殊
                guided_hint = None
            else:
                h = module(h, emb, context)
            outs.append(zero_conv(h, emb, context))  # 第二个zero，输出融合后的x

        h = self.middle_block(h, emb, context)
        outs.append(self.middle_block_out(h, emb, context))

        return outs

这部分就是上图中的control红框，每一个输出后面都有zero层，也对应了文章第一幅图。




ControlledUnetModel（diffusion_model）

终于来到了图1的左边，这块比上面的模块都要简单干净，分为编码和解码的unet结构，如下图：

diffusion_model




class ControlledUnetModel(UNetModel):
    def forward(self, x, timesteps=None, context=None, control=None, only_mid_control=False, **kwargs):
        hs = []
        # unet编码部分，加上条件控制
        with torch.no_grad():
            t_emb = timestep_embedding(timesteps, self.model_channels, repeat_only=False)
            emb = self.time_embed(t_emb)
            h = x.type(self.dtype)
            for module in self.input_blocks:
                h = module(h, emb, context)
                hs.append(h)
            h = self.middle_block(h, emb, context)

        if control is not None:  # 有图像控制就加上，完成条件control和编码的相加
            h += control.pop()

        # unet解码部分
        for i, module in enumerate(self.output_blocks):
            if only_mid_control or control is None:
                h = torch.cat([h, hs.pop()], dim=1)
            else:
                h = torch.cat([h, hs.pop() + control.pop()], dim=1)
            h = module(h, emb, context)

        h = h.type(x.dtype)
        return self.out(h)

而后就比较简单了，通过AutoencoderKL解码回去




采样部分

以上都没有提一个关键的东西，那就是前面文章一直推导的公式，推理起来一大块，实际上用的时候却找不到存在感。还是怪深度学习太火了，笔者去年写了篇扩散模型的回答，当时说过一个看法，仅仅个人觉得扩散模型实际上是挂着深度学习的皮卖着传统算法的肉，也很开心看见两者的融合，也更加有可解释性。这个可解释当时被一些读者误以为是深度学习可解释，其实并不是的。

言归正传，他这一部分核心代码如下：

# current prediction for x_0
if self.model.parameterization != "v":
    pred_x0 = (x - sqrt_one_minus_at * e_t) / a_t.sqrt()
else:
    pred_x0 = self.model.predict_start_from_z_and_v(x, t, model_output)

if quantize_denoised:
    pred_x0, _, *_ = self.model.first_stage_model.quantize(pred_x0)

if dynamic_threshold is not None:
    raise NotImplementedError()

# direction pointing to x_t
dir_xt = (1. - a_prev - sigma_t**2).sqrt() * e_t
noise = sigma_t * noise_like(x.shape, device, repeat_noise) * temperature
if noise_dropout > 0.:
    noise = torch.nn.functional.dropout(noise, p=noise_dropout)
x_prev = a_prev.sqrt() * pred_x0 + dir_xt + noise

我觉得这里必须得和公式对应上，由于我没有写有关于DDIM的分享，这里借用其他文章的图片。

有一些记号命名需要说明：

sqrt_one_minus_at： \sqrt{1-\bar{\alpha_{t}}^{2}}

a_t： \bar{\alpha_{t}}^{2}

a_prev：\bar{\alpha_{t-1}}^{2}

sigma_t： \tilde{\sigma_{t}}

第一部分为 x_{0}

将以上公式移项就是代码里面的pred_x0 计算

同理将一下式子里面合并一下是可以凑出一个pred_x0 的，也就得到了x_prev

以上就暂时结束了，话说今天小米汽车是真的帅啊，occ是不是如视频表现的样子还是挺期待的，不过感觉我这个打工人估计买不起了。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-3b624b3b752761c3d632ac275d20d15f_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-e4d465990719046ab9cecfac5503249b_1440w.jpg)

![图片](https://picx.zhimg.com/v2-1eb2f0ea571e88ca57b23908558b802b_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-35fe45103ac1f0441448f5ab07089d75_1440w.jpg)

![图片](https://pica.zhimg.com/v2-e9f071bc7dc204c6b7bab2c2e2340a08_1440w.jpg)

![图片](https://pica.zhimg.com/v2-d094a17895f399a7dd5f6a95ce786ad6_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-cdd387ff9948875c152bf1fb3b4d0e3f_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-69f3e97db2a89a72c1e60e3653e2573f.webp)

![图片](https://picx.zhimg.com/v2-9e16562f10b824640ba978fdd997ceb3_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-320afb325f5d8406902b05f363f3f7fb_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-3b624b3b752761c3d632ac275d20d15f_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-3bb879be3497db9051c1953cdf98def6.png)

![图片](https://pic1.zhimg.com/v2-ba138bd2a40f11a2c09352f0c600dd20_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-d29d1660ddd1fd55e1123937f52d3e25_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-7d3d19021d86772da2bd5d1c27be44c3_250x0.jpg?source=172ae18b)

