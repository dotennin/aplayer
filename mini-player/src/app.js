new Vue({
  el: "#app",
  componets: {
    "navigator": undefined,
  },
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
      isCataloguePath: false,
			navigatorPath: '',
			isPlayListOpen: true,
    };
  },
  methods: {
    play(track) {
			if (this.currentTrack === track) {
				return
			}
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
      return `mp3/${dir.Path}`;
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
      return /(\.mp3)|(\.mp4)|(\.wav)|(\.flac)|(\.m4a)$/.test(dir.Path);
    },
    encodePath(w) {
      var map = {
        "&": "%26",
        "<": "%3c",
        ">": "%3e",
        '"': "%22",
        "'": "%27",
				" ": "%20",
				"!": "&00A1",
				"/": "%2F",
				"#": "%23"
      };

      var encodedPic = encodeURI(w);
      var result = encodedPic.replace(/[&<>"']/g, function (m) {
        return map[m];
      });
      return result;
    },

    async getPath(dir) {
      if (!dir) {
        dir = { Path: localStorage.getItem('CURRENT_PATH') ?? "" };
      }
      const shouldPlayMedia = this.isMediafile(dir);
      if (shouldPlayMedia) {
				this.isPlayListOpen = false
        return this.play(dir);
      }
			localStorage.setItem('CURRENT_PATH', dir.Path)

      let pathList = await fetch(`api/path?name=${encodeURI(dir.Path)}`).then(
        (r) => r.json()
      );
			
			// if the path is invalid clear localStorage and research again
			if (!pathList) {
				localStorage.setItem('CURRENT_PATH', '')
				return this.getPath()
			}

      const slashCount = dir.Path.match(/\//g);
      this.isCataloguePath = slashCount && slashCount.length === 1;
      const isInCatalogDir = slashCount && slashCount.length > 1;

      if (this.isCataloguePath) {
        // clear cover list while accessing catalog path
        this.coverList = [];
				pathList = pathList.sort((a, b) => a.ModTime > b.ModTime ? -1 : 1)
				this.isPlayListOpen = false
        pathList.forEach((dir) => {
          const splitName = dir.Name.split("@");
          dir.Name = splitName[1];
          dir.RJNumber = splitName[0];
          dir.Thumbnail = this.encodePath(dir.Thumbnail);
        });
      } else {
				this.isPlayListOpen = true
			}
      if (isInCatalogDir) {
        pathList = pathList.filter((d) => {
          // don:t need to display image
          if (/(\.png)|(\.jpg)|(\.jpeg)$/.test(d.Name)) {
            this.coverList.push(this.encodePath("mp3" + d.Path));
            return false;
          }
          return true;
        });
        this.tracks = pathList
          .filter((dir) => this.isMediafile(dir))
          .map((t) => ({ Favorited: false, ...t }));
        this.currentTrack = this.tracks[0];
      }

			this.navigatorPath = dir.Path
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
    this.getPath();

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

Vue.component("navigator", {
  template: `
		<h1 class="title">
			<nav>
				<ul>
					<li :class="{active: pathList.length -1 === index}" @click="handlePathClick(index)" v-for="(path, index) in pathList" :key="path"><span>{{ path }}</span></li>
				</ul>
			</nav>
		</h1>
	`,
  props: {
    path: { type: String },
    getPath: { type: Function },
  },
  data: () => ({
    pathList: [],
  }),
  methods: {
    handlePathClick(pathIndex) {
      const dir = { Path: "" };
			const targetPath = this.pathList[pathIndex]
			this.pathList.map((path, index) => {
				if (index === 0) {
					path = ''
				}
				if (index <= pathIndex && index > 0) {
					dir.Path += `/${path}`
				}
			})
      // if (path !== `HOME`) {
      //   dir.Path = `/${path}`;
      // }
      this.getPath(dir);
    },
    filterPathList(path) {
      this.pathList = ["HOME", ...path.split("/").filter((p) => p)];
    },
  },
  watch: {
    path: {
      // the callback will be called immediately after the start of the observation
      immediate: true,
      handler(newPath, _) {
        this.pathList = ["HOME", ...newPath.split("/").filter((p) => p)];
      },
    },
  },
  created() {
    this.filterPathList(this.path);
  },
});
