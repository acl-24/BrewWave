import mne
from mne.preprocessing import ICA
from mne.time_frequency import psd_array_multitaper
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.svm import OneClassSVM
from sklearn.metrics import precision_score, recall_score, f1_score
import numpy as np


raw = mne.io.read_raw_fif('subject1.raw.fif', preload=True)


raw.filter(l_freq=1, h_freq=40)


ica = ICA(n_components=16, random_state=97, max_iter=800)
ica.fit(raw)
raw = ica.apply(raw)

events = mne.find_events(raw, stim_channel='Stim')


if events.size == 0:
    raise ValueError("No events found in the 'Stim' channel. Check your data and channel name.")

event_id = {'Trigger': 1}
epochs = mne.Epochs(raw, events, event_id, tmin=-1, tmax=4, baseline=(None, 0), preload=True)


psds, freqs = psd_array_multitaper(epochs.get_data(), sfreq=epochs.info['sfreq'], fmin=1, fmax=40, n_jobs=1)


n_epochs, n_channels, n_freqs = psds.shape
X = psds.reshape(n_epochs, -1)


event_ids = epochs.events[:, -1]


y = event_ids


unique_classes = np.unique(y)
print("Unique classes:", unique_classes)


svm_classifier = OneClassSVM(kernel='linear', nu=0.05)
svm_classifier.fit(X)


y_pred_train = svm_classifier.predict(X)


precision_train = precision_score(np.ones_like(y), y_pred_train)
recall_train = recall_score(np.ones_like(y), y_pred_train)
f1_train = f1_score(np.ones_like(y), y_pred_train)

print(f'Training Precision: {precision_train:.2f}')
print(f'Training Recall: {recall_train:.2f}')
print(f'Training F1-Score: {f1_train:.2f}')


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


y_pred_test = svm_classifier.predict(X_test)


precision_test = precision_score(np.ones_like(y_test), y_pred_test)
recall_test = recall_score(np.ones_like(y_test), y_pred_test)
f1_test = f1_score(np.ones_like(y_test), y_pred_test)

print(f'Test Precision: {precision_test:.2f}')
print(f'Test Recall: {recall_test:.2f}')
print(f'Test F1-Score: {f1_test:.2f}')
