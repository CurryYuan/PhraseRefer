# PhraseRefer

**Toward Explainable and Fine-Grained 3D Grounding through Referring Textual Phrases** [[Arxiv]](https://arxiv.org/abs/2207.01821) [[Project]](https://yanx27.github.io/phraserefer/)

Code will be released here.

## Abstract
Recent progress on 3D scene understanding has explored visual grounding (3DVG) to localize a target object through a language description. However, existing methods only consider the dependency between the entire sentence and the target object, thus ignoring fine-grained relationships between contexts and non-target ones. In this paper, we extend 3DVG to a more reliable and explainable task, called **3D Phrase Aware Grounding (3DPAG)**. The 3DPAG task aims to localize the target object in the 3D scenes by explicitly identifying all phrase-related objects and then conducting reasoning according to contextual phrases. To tackle this problem, we label about 400K phrase-level annotations from 170K sentences in available 3DVG datasets, i.e., Nr3D, Sr3D and ScanRefer. By tapping on these developed datasets, we propose **a novel framework, i.e., PhraseRefer**, which conducts phrase-aware and object-level representation learning through phrase-object alignment optimization as well as phrase-specific pre-training. In our setting, we extend previous 3DVG methods to the phrase-aware scenario and provide metrics to measure **the explainability of the 3DPAG task**. Extensive results confirm that 3DPAG effectively boosts the 3DVG, and PhraseRefer achieves **state-of-the-arts** across three datasets, i.e., 63.0%, 54.4% and 55.5% overall accuracy on Sr3D, Nr3D and ScanRefer, respectively.

## Framework
### Cross-modal Transformer with Phrase-Object Alignment (POA) Optimization
Part (a) illustrates our baseline model, i.e., cross-modal transformer, and part (b) shows the process of optimizing the phrase-object alignment map.
![1](https://yanx27.github.io/phraserefer/figs/figure2.png)

### Phrase-Specific Pre-training
In the phrase-specific pre-training stage, we generate the phrase-specific masks according to the grounding truth phrases, e.g., setting the position of “the office chair” to 1 and other positions to 0. Then, we design the network to predict the corresponding object of the selected phrase. During the fine-tuning stage, we only predict the target object referred by the whole sentence.
![2](https://yanx27.github.io/phraserefer/figs/figure3.png)

## Visualization Results
### Visualization Results of 3DVG
We visualize the visual grounding results of SAT and ours. The left four examples are our correct predictions while SAT is not. The right two examples show the representative failures for both current SOTA model SAT and our PhraseRefer. The green/red/blue colors illustrate the correct/incorrect/GT boxes. The target class for each query is shown in red color. We provide rendered scenes in the first row for better visualization. Best viewed in color.
![3](https://yanx27.github.io/phraserefer/figs/figure4.png)

#### Visualization Results of 3DPAG
We show examples of 3DPAG prediction and POA map of our method.The corresponding phrase and bounding box are drawn in the same color. Best viewed in color.
![4](https://yanx27.github.io/phraserefer/figs/figure5.png)

## Citation
If you find our work helpful, please consider citing
```
@article{yuan2022toward,
  title={Toward Explainable and Fine-Grained 3D Grounding through Referring Textual Phrases},
  author={Yuan, Zhihao and Yan, Xu and Li, Zhuo and Li, Xuhao and Guo, Yao and Cui, Shuguang and Li, Zhen},
  journal={arXiv preprint arXiv:2207.01821},
  year={2022}
}
```
