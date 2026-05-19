# 🧠 Alzheimer's Disease Detection: A Multi-Modal AI Pipeline
**Authors:** Zyad Mohamed & Rowayda Hatem

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Latest-yellow)
![Streamlit](https://img.shields.io/badge/Streamlit-UI-red)

**Developed by:** Zyad Mohamed Saied (Toza) & Rowayda Hatem  
**Domain:** Machine Learning, Computer Vision, Data Engineering, Healthcare AI  

---

## 📌 Project Overview
This repository contains a comprehensive, end-to-end Machine Learning architecture designed for the early detection of Alzheimer’s Disease (AD). Because clinical diagnostics cannot rely on a single source of truth, this project utilizes a **multi-modal approach**, bridging structured clinical tabular data with complex spatial neuroimaging (MRI) data.

A primary focus of this research is overcoming **Domain Shift**—the tendency for medical AI to fail when exposed to data from different hospitals—via advanced Computer Vision and Data Engineering pipelines.

---

## 🔬 Phase 1: Clinical Tabular Pipeline
Analyzed patient demographic and cognitive metrics (Age, MMSE, Clinical Dementia Rating) aggregated from OASIS-1, OASIS-2, ADNI, and Kaggle. Because this is a medical application, models were optimized for **Recall (Sensitivity)** to minimize False Negatives.

### Tabular Model Performance
| Model Architecture | Accuracy | Recall | Engineering Insight |
| :--- | :---: | :---: | :--- |
| **Logistic Regression** | 59% | 87% | Linear boundary failed to capture complex biomarker interactions. |
| **Random Forest** | 64% | 87% | Tree-based model struggled with high variance and noise in aggregated clinical data. |
| **Artificial Neural Network (ANN)** | 64% | 75% | Custom funnel MLP (64->32->16) heavily regularized with Dropout. |
| **SVM (RBF Kernel)** | **83%** | **83%** | **🏆 Best Performing.** Utilized the *Kernel Trick* to map overlapping data into higher dimensions, drawing optimal curved decision boundaries. |

---

## 👁️ Phase 2: Neuroimaging (MRI) Pipeline
Processed complex 3D NIfTI (`.hdr`) and 2D MRI slices to detect minute structural changes in the cerebral cortex. We engineered a strict **OpenCV Computer Vision Pipeline** to mitigate domain shifts between Kaggle and external OASIS datasets by auto-cropping black borders and equalizing contrast (CLAHE).

### Spatial Model Performance
| Model Architecture | Engineering Insight |
| :--- | :--- |
| **DenseNet121** | High-resolution (`176x176`) Transfer Learning model. Dense connections mitigated vanishing gradients, successfully validating on external OASIS data (resolving domain shift). |
| **Xception** | Implemented **Depthwise Separable Convolutions** for lightweight, highly efficient spatial mapping. Integrated with a custom RAM-ingestion pipeline for advanced data balancing. |

---

## 🖥️ Interactive Medical Dashboard
Bridging the gap between AI research and clinical application, we developed a professional, hospital-themed User Interface using **Streamlit**. 

**UI Features:**
* Slider inputs for tabular clinical data (Age, MMSE, CDR).
* Drag-and-drop file uploader for MRI scans (`.png`, `.jpg`).
* Real-time diagnostic probability engine with medical disclaimers.

---

## 📁 Repository Structure

```text
Alzheimer-s-Disease-Detection/
│
├── data/                      # All datasets (Ensure raw images are ignored in .gitignore)
│   ├── raw/                   # Untouched, original clinical data
│   └── processed/             # Cleaned data ready for modeling
│
├── notebooks/                 # Numbered notebooks for a clear execution pipeline
│   ├── 01_EDA.ipynb           # Exploratory Data Analysis for tabular metrics
│   ├── 02_EDA_IMAGES.ipynb    # Spatial analysis and preprocessing for neuroimaging
│   ├── 03_machine_learning/   # Traditional ML models for tabular data
│   │   ├── Logistic Regression.ipynb
│   │   ├── Random Forest.ipynb
│   │   └── SVM.ipynb
│   └── 04_deep_learning/      # Advanced DL models for tabular and image data
│       ├── ANN.ipynb
│       ├── CNN.ipynb
│       └── DenseNet.ipynb
│
├── models/                    # Saved weights (.keras files) for reproducibility
│
├── ui/
|
├── .gitattributes             # Git configuration and LFS tracking
├── .gitignore                 # Prevents uploading massive raw image folders
└── README.md                  # Project documentation and engineering summary