"""
Setup for transcription backend
"""
from setuptools import setup, find_packages

setup(
    name="transcription-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[],  # Dependências vêm do requirements.txt
    python_requires=">=3.12",
)
