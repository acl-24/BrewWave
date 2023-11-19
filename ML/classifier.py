import mne
from mne.preprocessing import ICA
from mne.time_frequency import psd_array_multitaper
from sklearn.model_selection import train_test_split
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.metrics import accuracy_score, precision_score
import numpy as np
from pynput.keyboard import Controller
import time
import matplotlib.pyplot as plt

raw = mne.io.read_raw_fif('subject3.raw.fif', preload=True)

raw.filter(l_freq=1, h_freq=40)

ica = ICA(n_components=16, random_state=97, max_iter=800)
ica.fit(raw)
raw = ica.apply(raw)

events = mne.find_events(raw, stim_channel='Stim')

if not events.size:
    raise ValueError("No events found. Check your data and channel name.")

print("Actual events in the dataset:")
print(events)

event_id = {'Resting': 1, 'Active': 2}
print("Event ID dictionary:")
print(event_id)


epochs = mne.Epochs(raw, events, event_id, tmin=0, tmax=3, baseline=(0, 0), preload=True)


psds, freqs = psd_array_multitaper(epochs.get_data(), sfreq=epochs.info['sfreq'], fmin=1, fmax=40, n_jobs=1)

n_epochs, n_channels, n_freqs = psds.shape
X = psds.reshape(n_epochs, -1)

event_ids = epochs.events[:, -1]
y = np.where(event_ids == event_id['Active'], 'Active', 'Resting')

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

lda_classifier = LinearDiscriminantAnalysis()
lda_classifier.fit(X_train, y_train)

y_pred_all = lda_classifier.predict(X)

y_pred_test = lda_classifier.predict(X_test)

y_pred_train = lda_classifier.predict(X_train)

accuracy = accuracy_score(y_test, y_pred_test)
precision = precision_score(y_test, y_pred_test, pos_label='Active')

accuracy_train = accuracy_score(y_train, y_pred_train)
precision_train = precision_score(y_train, y_pred_train, pos_label='Active')

print('Accuracy on the training set: {:.3f}%'.format(accuracy_train * 100))
print('Precision on the training set: {:.3f}%\n'.format(precision_train * 100))

print('Accuracy on the test set: {:.3f}%'.format(accuracy * 100))
print('Precision on the test set: {:.3f}%'.format(precision * 100))

print("Predicted labels for the entire dataset:")
print(y_pred_all)

keyboard = Controller()

for i, label in enumerate(y_pred_all):
    if label == 'Active' and (i == 0 or y_pred_all[i - 1] != 'Active'):
        keyboard.press('s')
        keyboard.release('s')
        time.sleep(2)

