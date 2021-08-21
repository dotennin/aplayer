new Vue({
  el: "#app",
  data() {
    return {
      audio: null,
      circleLeft: null,
      barWidth: null,
      duration: null,
      currentTime: null,
      isTimerPlaying: false,
      tracks: [],
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null,
      pathList: [],
      coverList: [],
      currentCoverIndex: 0,
    };
  },
  methods: {
    play(track) {
      if (track) {
        this.currentTrack = track;
        this.audio.src = this.getSource(track);
      } else if (!this.audio.src) {
        this.currentTrack = this.tracks[0];
        this.audio.src = this.getSource(this.tracks[0]);
      }

      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },
    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + "%";
      this.circleLeft = width + "%";
      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration - durmin * 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime - curmin * 60);
      if (durmin < 10) {
        durmin = "0" + durmin;
      }
      if (dursec < 10) {
        dursec = "0" + dursec;
      }
      if (curmin < 10) {
        curmin = "0" + curmin;
      }
      if (cursec < 10) {
        cursec = "0" + cursec;
      }
      this.duration = durmin + ":" + dursec;
      this.currentTime = curmin + ":" + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.barWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.audio.play();
    },
    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },
    prevTrack() {
      this.transitionName = "scale-in";
      this.isShowCover = false;
      let currentTrackIndex = this.tracks.findIndex(
        (track) => track === this.currentTrack
      );
      if (currentTrackIndex > 0) {
        currentTrackIndex--;
      } else {
        currentTrackIndex = this.tracks.length - 1;
      }
      this.currentTrack = this.tracks[currentTrackIndex];
      this.resetPlayer();
    },
    nextTrack() {
      this.transitionName = "scale-out";
      this.isShowCover = false;
      let currentTrackIndex = this.tracks.findIndex(
        (track) => track === this.currentTrack
      );
      if (currentTrackIndex < this.tracks.length - 1) {
        currentTrackIndex++;
      } else {
        currentTrackIndex = 0;
      }
      this.currentTrack = this.tracks[currentTrackIndex];
      this.resetPlayer();
    },
    nextCover() {
      this.currentCoverIndex =
        this.currentCoverIndex + 1 < this.coverList.length
          ? this.currentCoverIndex + 1
          : 0;
    },
		getSource(dir) {
			return `mp3/${dir.Path}`
		},
    resetPlayer() {
      this.barWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      this.audio.src = this.getSource(this.currentTrack);
      setTimeout(() => {
        if (this.isTimerPlaying) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      }, 300);
    },
    favorite() {
      this.tracks[this.currentTrackIndex].Favorited =
        !this.tracks[this.currentTrackIndex].Favorited;
    },
    isMediafile(dir) {
      return /(\.mp3)|(\.mp4)|(\.wav)|(\.flac)$/.test(dir.Path);
    },

    async getPath(dir) {
      if (!dir) {
        dir = { Path: "" };
      }
      const shouldPlayMedia = this.isMediafile(dir);
      if (shouldPlayMedia) {
        return this.play(dir);
      }

      let pathList = await fetch(`api/path?name=${encodeURI(dir.Path)}`).then(
        (r) => r.json()
      );

      const slashCount = dir.Path.match(/\//g);
      const isCataloguePath = slashCount && slashCount.length === 1;
      const isInCatalogDir = slashCount && slashCount.length > 1;

      if (isCataloguePath) {
        // clear cover list while accessing catalog path
        this.coverList = [];
        pathList.forEach((dir) => {
          dir.Name = dir.Name.split("@")[1];
        });
      }
      if (isInCatalogDir) {
        pathList = pathList.filter((d) => {
          // don:t need to display image
          if (/(\.png)|(\.jpg)|(\.jpeg)$/.test(d.Name)) {
            this.coverList.push(encodeURI("mp3" + d.Path));
            return false;
          }
          return true;
        });
        this.tracks = pathList
          .filter((dir) => this.isMediafile(dir))
          .map((t) => ({ Favorited: false, ...t }));
        this.currentTrack = this.tracks[0];
      }

      this.pathList = pathList;
    },
  },
  created() {
    let vm = this;
    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.ontimeupdate = function () {
      vm.generateTime();
    };
    this.audio.onloadedmetadata = function () {
      vm.generateTime();
    };
    this.audio.onended = function () {
      vm.nextTrack();
      this.isTimerPlaying = true;
    };
    this.getPath("");

    // this is optional (for preload covers)
    for (let index = 0; index < this.tracks.length; index++) {
      const element = this.tracks[index];
      let link = document.createElement("link");
      link.rel = "prefetch";
      link.href = element.cover;
      link.as = "image";
      document.head.appendChild(link);
    }
  },
});
