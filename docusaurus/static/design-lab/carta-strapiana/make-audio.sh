#!/bin/sh
# Rebuilds audio/*.mp3 from the CC0 sources in audio-src/ (see audio/CREDITS.txt
# for where each source came from). Nothing is added: each file is one continuous
# cut of one recording, band-limited, level-matched and given a breath of silence
# so it loops the way a person hums - with a pause to draw breath.
set -e
cd "$(dirname "$0")"
mk() {
  fadeat=$(python3 -c "print(round($3-0.45,3))")
  ffmpeg -v error -y -ss "$2" -t "$3" -i "audio-src/$1.mp3" \
    -af "highpass=f=95,lowpass=f=6200,afade=t=in:st=0:d=0.22,afade=t=out:st=${fadeat}:d=0.45,apad=pad_dur=$5,loudnorm=I=-22:TP=-3:LRA=11,aresample=22050" \
    -ac 1 -c:a libmp3lame -b:a 48k "audio/$4.mp3"
}
mk crowd_mmm 1.0  6.4  hum-crowd  1.1
mk hum_fsmin 0.5  14.2 hum-steady 1.4
mk hum_amin  1.0  11.4 hum-second 1.3
mk hum_cda   22.0 12.0 hum-third  1.6
mk woman_hum 10.0 7.6  hum-high   1.5
mk male_hum  0.05 1.32 hum-call   1.9
du -sk audio

# ---- the r10 bank: one-shot phrases for the shanty PROGRAM (no loop padding;
# the scheduler owns the silence between phrases). Same band-limit and
# loudness law as the six above. Sources verified CC0 on their freesound
# licence pages on 2026-09-05; see audio/CREDITS.txt.
mk2() {
  fadeat=$(python3 -c "print(round($3-0.45,3))")
  ffmpeg -v error -y -ss "$2" -t "$3" -i "audio-src/$1.mp3" \
    -af "highpass=f=95,lowpass=f=6200,afade=t=in:st=0:d=0.20,afade=t=out:st=${fadeat}:d=0.45,loudnorm=I=-22:TP=-3:LRA=11,aresample=22050" \
    -ac 1 -c:a libmp3lame -b:a 48k "audio/$4.mp3"
}
mk2 low_chant       0.10 10.80 chant-low
mk2 high_chant      0.05  8.15 chant-high
mk2 male_deep       0.05  4.30 call-deep
mk2 carnival_voc_hq 16.90 11.30 verse-carnival
mk2 girl_hum_hq     0.30 10.70 hum-girl
mk2 bride_hum_hq    17.40 12.10 hum-bride
mk2 waltz_hum_hq    38.40 12.00 hum-waltz
mk2 maya_soft       6.35  3.10 hum-soft
mk2 maya_chorus     0.05 11.50 chorus-maya
mk2 sapere_girl     1.20 10.40 hum-sapere
# the one short group shout: fades tightened to its 0.64 s
ffmpeg -v error -y -t 0.64 -i "audio-src/hey_together.mp3" \
  -af "highpass=f=95,lowpass=f=6200,afade=t=in:st=0:d=0.03,afade=t=out:st=0.50:d=0.14,loudnorm=I=-22:TP=-3:LRA=11,aresample=22050" \
  -ac 1 -c:a libmp3lame -b:a 48k "audio/hey-all.mp3"
