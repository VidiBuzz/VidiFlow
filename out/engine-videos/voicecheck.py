import sys, glob, subprocess, numpy as np, json, os, re
def load(p):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ar","16000","-ac","1","-f","s16le","-"],capture_output=True).stdout
    return np.frombuffer(raw,np.int16).astype(np.float32)/32768
def f0_track(x, sr=16000):
    fr, hop = 640, 160; f0=[]
    for i in range(0, len(x)-fr, hop):
        w = x[i:i+fr]*np.hanning(fr)
        if np.sqrt((w**2).mean()) < 0.01: continue
        ac = np.correlate(w,w,'full')[fr-1:]; lo,hi = sr//400, sr//70
        k = lo+np.argmax(ac[lo:hi]);
        if ac[k] > 0.35*ac[0]: f0.append(sr/k)
    return np.array(f0)
def centroid(x, sr=16000):
    S = np.abs(np.fft.rfft(x[:len(x)//1024*1024].reshape(-1,1024)*np.hanning(1024),axis=1)); f=np.fft.rfftfreq(1024,1/sr)
    e = S.sum(1); S=S[e>np.percentile(e,30)]
    return float((S*f).sum()/S.sum())
rows=[]
for p in sorted(glob.glob(sys.argv[1]+"/a*_*.mp3")+glob.glob(sys.argv[1]+"/a*_*.wav")):
    x=load(p); f=f0_track(x)
    rows.append((os.path.basename(p), len(x)/16000, float(np.median(f)) if len(f) else 0, float(np.percentile(f,10)) if len(f) else 0, float(np.percentile(f,90)) if len(f) else 0, centroid(x)))
for r in rows: print("%-12s dur=%.2fs f0_med=%.0fHz p10=%.0f p90=%.0f centroid=%.0fHz"%r)
