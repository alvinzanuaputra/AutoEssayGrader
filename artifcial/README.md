1. buat virtual venv install dependencies `pip install -r requirements.txt`

```bash
cd artificial
# alternatif virtual env python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
# deactivate untuk mematikan mode .venv
```


# installation 

```bash
PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial> python -m venv .venv
PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial> .\.venv\Scripts\activate
(.venv) PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial> pip install -r requirements.txt
Collecting opencv-python
  Downloading opencv_python-4.12.0.88-cp37-abi3-win_amd64.whl (39.0 MB)
     |████████████████████████████████| 39.0 MB 3.3 MB/s
Collecting cvzone
  Using cached cvzone-1.6.1-py3-none-any.whl
Collecting numpy
  Using cached numpy-2.2.6-cp310-cp310-win_amd64.whl (12.9 MB)
Collecting Pillow
  Downloading pillow-11.3.0-cp310-cp310-win_amd64.whl (7.0 MB)
     |████████████████████████████████| 7.0 MB 1.3 MB/s
Collecting matplotlib
  Downloading matplotlib-3.10.7-cp310-cp310-win_amd64.whl (8.1 MB)
     |████████████████████████████████| 8.1 MB 3.3 MB/s
Collecting PyMuPDF
  Downloading pymupdf-1.26.5-cp39-abi3-win_amd64.whl (18.7 MB)
     |████████████████████████████████| 18.7 MB 2.2 MB/s
Collecting transformers
  Downloading transformers-4.57.0-py3-none-any.whl (12.0 MB)
     |████████████████████████████████| 12.0 MB 2.2 MB/s
Collecting torch
  Downloading torch-2.8.0-cp310-cp310-win_amd64.whl (241.4 MB)
     |████████████████████████████████| 241.4 MB 90 kB/s
Collecting fonttools>=4.22.0
  Downloading fonttools-4.60.1-cp310-cp310-win_amd64.whl (2.3 MB)
     |████████████████████████████████| 2.3 MB 3.3 MB/s
Collecting packaging>=20.0
  Downloading packaging-25.0-py3-none-any.whl (66 kB)
     |████████████████████████████████| 66 kB 4.5 MB/s
Collecting pyparsing>=3
  Downloading pyparsing-3.2.5-py3-none-any.whl (113 kB)
     |████████████████████████████████| 113 kB 2.2 MB/s
Collecting contourpy>=1.0.1
  Downloading contourpy-1.3.2-cp310-cp310-win_amd64.whl (221 kB)
     |████████████████████████████████| 221 kB 3.3 MB/s
Collecting cycler>=0.10
  Downloading cycler-0.12.1-py3-none-any.whl (8.3 kB)
Collecting python-dateutil>=2.7
  Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
Collecting kiwisolver>=1.3.1
  Downloading kiwisolver-1.4.9-cp310-cp310-win_amd64.whl (73 kB)
     |████████████████████████████████| 73 kB 2.6 MB/s
Collecting pyyaml>=5.1
  Using cached pyyaml-6.0.3-cp310-cp310-win_amd64.whl (158 kB)
Collecting regex!=2019.12.17
  Downloading regex-2025.9.18-cp310-cp310-win_amd64.whl (276 kB)
     |████████████████████████████████| 276 kB 3.3 MB/s
Collecting tokenizers<=0.23.0,>=0.22.0
  Downloading tokenizers-0.22.1-cp39-abi3-win_amd64.whl (2.7 MB)
     |████████████████████████████████| 2.7 MB 6.4 MB/s
Collecting huggingface-hub<1.0,>=0.34.0
  Downloading huggingface_hub-0.35.3-py3-none-any.whl (564 kB)
     |████████████████████████████████| 564 kB 1.7 MB/s
Collecting tqdm>=4.27
  Downloading tqdm-4.67.1-py3-none-any.whl (78 kB)
     |████████████████████████████████| 78 kB 5.5 MB/s
Collecting safetensors>=0.4.3
  Downloading safetensors-0.6.2-cp38-abi3-win_amd64.whl (320 kB)
     |████████████████████████████████| 320 kB 1.1 MB/s
Collecting filelock
  Downloading filelock-3.20.0-py3-none-any.whl (16 kB)
Collecting requests
  Downloading requests-2.32.5-py3-none-any.whl (64 kB)
     |████████████████████████████████| 64 kB 4.8 MB/s
Collecting typing-extensions>=4.10.0
  Using cached typing_extensions-4.15.0-py3-none-any.whl (44 kB)
Collecting fsspec
  Downloading fsspec-2025.9.0-py3-none-any.whl (199 kB)
     |████████████████████████████████| 199 kB 1.3 MB/s
Collecting jinja2
  Using cached jinja2-3.1.6-py3-none-any.whl (134 kB)
Collecting sympy>=1.13.3
  Downloading sympy-1.14.0-py3-none-any.whl (6.3 MB)
     |████████████████████████████████| 6.3 MB 3.2 MB/s
Collecting networkx
  Downloading networkx-3.4.2-py3-none-any.whl (1.7 MB)
     |████████████████████████████████| 1.7 MB 1.3 MB/s
Collecting six>=1.5
  Using cached six-1.17.0-py2.py3-none-any.whl (11 kB)
Collecting mpmath<1.4,>=1.1.0
  Downloading mpmath-1.3.0-py3-none-any.whl (536 kB)
     |████████████████████████████████| 536 kB 6.4 MB/s
Collecting colorama
  Using cached colorama-0.4.6-py2.py3-none-any.whl (25 kB)
Collecting MarkupSafe>=2.0
  Using cached markupsafe-3.0.3-cp310-cp310-win_amd64.whl (15 kB)
Collecting certifi>=2017.4.17
  Using cached certifi-2025.10.5-py3-none-any.whl (163 kB)
Collecting urllib3<3,>=1.21.1
  Using cached urllib3-2.5.0-py3-none-any.whl (129 kB)
Collecting idna<4,>=2.5
  Using cached idna-3.10-py3-none-any.whl (70 kB)
Collecting charset_normalizer<4,>=2
  Downloading charset_normalizer-3.4.3-cp310-cp310-win_amd64.whl (107 kB)
     |████████████████████████████████| 107 kB 3.2 MB/s
Installing collected packages: urllib3, idna, colorama, charset-normalizer, certifi, typing-extensions, tqdm, requests, pyyaml, packaging, fsspec, filelock, six, numpy, mpmath, MarkupSafe, huggingface-hub, tokenizers, sympy, safetensors, regex, python-dateutil, pyparsing, Pillow, opencv-python, networkx, kiwisolver, jinja2, fonttools, cycler, contourpy, transformers, torch, PyMuPDF, matplotlib, cvzone
Successfully installed MarkupSafe-3.0.3 Pillow-11.3.0 PyMuPDF-1.26.5 certifi-2025.10.5 charset-normalizer-3.4.3 colorama-0.4.6 contourpy-1.3.2 cvzone-1.6.1 cycler-0.12.1 filelock-3.20.0 fonttools-4.60.1 fsspec-2025.9.0 huggingface-hub-0.35.3 idna-3.10 jinja2-3.1.6 kiwisolver-1.4.9 matplotlib-3.10.7 mpmath-1.3.0 networkx-3.4.2 numpy-2.2.6 opencv-python-4.12.0.88 packaging-25.0 pyparsing-3.2.5 python-dateutil-2.9.0.post0 pyyaml-6.0.3 regex-2025.9.18 requests-2.32.5 safetensors-0.6.2 six-1.17.0 sympy-1.14.0 tokenizers-0.22.1 torch-2.8.0 tqdm-4.67.1 transformers-4.57.0 typing-extensions-4.15.0 urllib3-2.5.0
WARNING: You are using pip version 21.2.3; however, version 25.2 is available.
You should consider upgrading via the 'C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial\.venv\Scripts\python.exe -m pip install --upgrade pip' command.
(.venv) PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial>
(.venv) PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial> python.exe -m pip install --upgrade pip
Requirement already satisfied: pip in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (21.2.3)
Collecting pip
  Using cached pip-25.2-py3-none-any.whl (1.8 MB)
Installing collected packages: pip
  Attempting uninstall: pip
    Found existing installation: pip 21.2.3
    Uninstalling pip-21.2.3:
      Successfully uninstalled pip-21.2.3
Successfully installed pip-25.2
(.venv) PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial> pip install -r requirements.txt
Requirement already satisfied: opencv-python in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 2)) (4.12.0.88)
Requirement already satisfied: cvzone in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 3)) (1.6.1)
Requirement already satisfied: numpy in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 4)) (2.2.6)
Requirement already satisfied: Pillow in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 5)) (11.3.0)
Requirement already satisfied: matplotlib in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 6)) (3.10.7)
Requirement already satisfied: PyMuPDF in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 9)) (1.26.5)
Requirement already satisfied: transformers in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 12)) (4.57.0)
Requirement already satisfied: torch in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from -r requirements.txt (line 13)) (2.8.0)
Requirement already satisfied: contourpy>=1.0.1 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (1.3.2)
Requirement already satisfied: cycler>=0.10 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (0.12.1)
Requirement already satisfied: fonttools>=4.22.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (4.60.1)
Requirement already satisfied: kiwisolver>=1.3.1 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (1.4.9)
Requirement already satisfied: packaging>=20.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (25.0)
Requirement already satisfied: pyparsing>=3 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (3.2.5)
Requirement already satisfied: python-dateutil>=2.7 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from matplotlib->-r requirements.txt (line 6)) (2.9.0.post0)
Requirement already satisfied: filelock in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (3.20.0)
Requirement already satisfied: huggingface-hub<1.0,>=0.34.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (0.35.3)
Requirement already satisfied: pyyaml>=5.1 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (6.0.3)
Requirement already satisfied: regex!=2019.12.17 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (2025.9.18)
Requirement already satisfied: requests in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (2.32.5)
Requirement already satisfied: tokenizers<=0.23.0,>=0.22.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (0.22.1)
Requirement already satisfied: safetensors>=0.4.3 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (0.6.2)
Requirement already satisfied: tqdm>=4.27 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from transformers->-r requirements.txt (line 12)) (4.67.1)
Requirement already satisfied: fsspec>=2023.5.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from huggingface-hub<1.0,>=0.34.0->transformers->-r requirements.txt (line 12)) (2025.9.0)
Requirement already satisfied: typing-extensions>=3.7.4.3 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from huggingface-hub<1.0,>=0.34.0->transformers->-r requirements.txt (line 12)) (4.15.0)
Requirement already satisfied: sympy>=1.13.3 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from torch->-r requirements.txt (line 13)) (1.14.0)
Requirement already satisfied: networkx in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from torch->-r requirements.txt (line 13)) (3.4.2)
Requirement already satisfied: jinja2 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from torch->-r requirements.txt (line 13)) (3.1.6)
Requirement already satisfied: six>=1.5 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from python-dateutil>=2.7->matplotlib->-r requirements.txt (line 6)) (1.17.0)
Requirement already satisfied: mpmath<1.4,>=1.1.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from sympy>=1.13.3->torch->-r requirements.txt (line 13)) (1.3.0)
Requirement already satisfied: colorama in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from tqdm>=4.27->transformers->-r requirements.txt (line 12)) (0.4.6)
Requirement already satisfied: MarkupSafe>=2.0 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from jinja2->torch->-r requirements.txt (line 13)) (3.0.3)
Requirement already satisfied: charset_normalizer<4,>=2 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from requests->transformers->-r requirements.txt (line 12)) (3.4.3)
Requirement already satisfied: idna<4,>=2.5 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from requests->transformers->-r requirements.txt (line 12)) (3.10)
Requirement already satisfied: urllib3<3,>=1.21.1 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from requests->transformers->-r requirements.txt (line 12)) (2.5.0)
Requirement already satisfied: certifi>=2017.4.17 in c:\asus tuf gaming\documentation\semester 5\pemrograman berbasis kerangka kerja\auto essay grader\autoessaygrader\artifcial\.venv\lib\site-packages (from requests->transformers->-r requirements.txt (line 12)) (2025.10.5)
(.venv) PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial> py .\main.py
Using a slow image processor as `use_fast` is unset and a slow processor was saved with this model. `use_fast=True` will be the default behavior in v4.52, even if the model was saved with a slow processor. This will result in minor differences in outputs. You'll still be able to use a slow processor with `use_fast=False`.
Some weights of VisionEncoderDecoderModel were not initialized from the model checkpoint at microsoft/trocr-large-handwritten and are newly initialized: ['encoder.pooler.dense.bias', 'encoder.pooler.dense.weight']
You should probably TRAIN this model on a down-stream task to be able to use it for predictions and inference.
[INFO] Mengubah PDF ke gambar...
[INFO] Memproses output_images\page_1.png...
✅ [Perspective] Koreksi perspektif berhasil (robust mode).
✅ [Boxes] Jumlah kotak terdeteksi: 6
Xet Storage is enabled for this repo, but the 'hf_xet' package is not installed. Falling back to regular HTTP download. For better performance, install the package with: `pip install huggingface_hub[hf_xet]` or `pip install hf_xet`
model.safetensors: 100%|████████████████████████████████████████████████████| 2.23G/2.23G [00:26<00:00, 4.24MB/s]
C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial\.venv\lib\site-packages\huggingface_hub\file_download.py:143: UserWarning: `huggingface_hub` cache-system uses symlinks by default to efficiently store duplicated files but your machine does not support them in C:\Users\Admin\.cache\huggingface\hub\models--microsoft--trocr-large-handwritten. Caching files will still work but in a degraded version that might require more space on your disk. This warning can be disabled by setting the `HF_HUB_DISABLE_SYMLINKS_WARNING` environment variable. For more details, see https://huggingface.co/docs/huggingface_hub/how-to-cache#limitations.
To support symlinks on Windows, you either need to activate Developer Mode or to run Python as an administrator. In order to activate developer mode, see this article: https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development
  warnings.warn(message)
[INFO] OCR selesai. Hasil tersimpan di hasil_ocr.txt
(.venv) PS C:\ASUS TUF GAMING\Documentation\Semester 5\Pemrograman Berbasis Kerangka Kerja\Auto Essay Grader\AutoEssayGrader\artifcial>
```

py main.py 
