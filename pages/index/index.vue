<template>
  <view class="page-shell">
    <view class="space-scene">
      <canvas class="earth-canvas" :canvas-id="canvasId" />
    </view>

    <view class="sleep-panel">
      <view class="sound-list">
        <view
          v-for="item in soundList"
          :key="item.key"
          class="sound-item"
          :class="{ active: selectedSound === item.key }"
          @click="switchSound(item.key)"
        >
          <text class="name">{{ item.label }}</text>
        </view>
      </view>

      <view class="control-row main-action">
        <button class="play-btn" @click="togglePlay">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
      </view>

      <view class="control-row volume-row">
        <text class="label">音量</text>
        <slider
          class="volume-slider"
          :value="volume"
          :min="0"
          :max="100"
          activeColor="#9ab8d9"
          backgroundColor="#23365d"
          block-color="#effaff"
          @change="handleVolumeChange"
        />
        <text class="value">{{ volume }}%</text>
      </view>

      <view class="control-row timer-row">
        <text class="label">定时</text>
        <view class="timer-options">
          <view
            v-for="item in timerOptions"
            :key="item.value"
            class="timer-item"
            :class="{ active: timerValue === item.value }"
            @click="setTimer(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="status-panel">
        <text>{{ statusText }}</text>
        <text v-if="timerValue > 0"> · {{ formatTimer(timerLeft) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { createEarthScene } from '../../static/js/threejs-miniprogram.js'

export default {
  data() {
    return {
      canvasId: 'earthCanvas',
      sceneEngine: null,
      audioCtx: null,
      isPlaying: false,
      selectedSound: 'rain',
      volume: 55,
      timerValue: 0,
      timerLeft: 0,
      countdownTimer: null,
      statusText: '未播放',
      soundList: [
        { key: 'rain', label: '夜雨' },
        { key: 'wave', label: '海浪' },
        { key: 'forest', label: '森林' },
        { key: 'white', label: '白噪' }
      ],
      timerOptions: [
        { label: '关', value: 0 },
        { label: '15分', value: 15 },
        { label: '30分', value: 30 },
        { label: '45分', value: 45 },
        { label: '60分', value: 60 },
        { label: '90分', value: 90 }
      ],
      audioMap: {
        rain: '/static/audio/night-rain.mp3',
        wave: '/static/audio/sea-wave.mp3',
        forest: '/static/audio/forest.mp3',
        white: '/static/audio/white-noise.mp3'
      }
    }
  },
  onReady() {
    this.setupScene()
    this.setupAudio()
  },
  onHide() {
    this.pauseAudioSafely()
  },
  onUnload() {
    this.cleanup()
  },
  methods: {
    setupScene() {
      this.sceneEngine = createEarthScene({
        canvasId: this.canvasId,
        vm: this
      })
      this.sceneEngine.start()
    },
    setupAudio() {
      if (this.audioCtx) return
      const audio = uni.createInnerAudioContext && uni.createInnerAudioContext()
      if (!audio) {
        this.statusText = '音频组件不可用'
        return
      }

      audio.loop = true
      audio.obeyMuteSwitch = false
      audio.volume = Number((this.volume / 100).toFixed(2))
      this.audioCtx = audio
      this.audioCtx.onEnded = () => {
        this.isPlaying = false
        this.statusText = '已暂停'
      }
    },
    switchSound(key) {
      this.selectedSound = key
      const label = this.soundList.find((item) => item.key === key)?.label || '音效'

      if (this.audioCtx) {
        this.audioCtx.stop()
      }

      this.isPlaying = false
      this.statusText = `已切换到 ${label}`

      if (this.audioCtx && this.audioMap[key]) {
        this.audioCtx.src = this.audioMap[key]
      }
    },
    togglePlay() {
      if (!this.audioCtx) {
        this.setupAudio()
      }
      if (!this.audioCtx) {
        this.statusText = '音频初始化失败'
        return
      }
      if (this.isPlaying) {
        this.pauseAudioSafely()
        return
      }
      this.playAudio()
    },
    playAudio() {
      const src = this.audioMap[this.selectedSound]
      if (!src) {
        this.statusText = '暂无该音效'
        return
      }
      if (this.audioCtx.src !== src) {
        this.audioCtx.src = src
      }
      this.audioCtx.play()
      this.isPlaying = true
      this.statusText = '正在播放'
    },
    pauseAudioSafely() {
      if (!this.audioCtx) return
      this.audioCtx.pause()
      this.isPlaying = false
      this.statusText = '已暂停'
    },
    handleVolumeChange(event) {
      const value = Number(event.detail.value)
      this.volume = value
      if (this.audioCtx) {
        this.audioCtx.volume = Number((value / 100).toFixed(2))
      }
    },
    setTimer(minutes) {
      this.timerValue = minutes
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      if (minutes <= 0) {
        this.timerLeft = 0
        this.statusText = '定时已关闭'
        return
      }
      this.timerLeft = minutes * 60
      this.statusText = `定时 ${minutes} 分钟`
      this.countdownTimer = setInterval(() => {
        if (this.timerLeft <= 0) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
          this.timerLeft = 0
          this.timerValue = 0
          this.pauseAudioSafely()
          this.statusText = '定时结束，已暂停'
          return
        }
        this.timerLeft -= 1
      }, 1000)
    },
    formatTimer(seconds) {
      const minute = Math.floor(seconds / 60)
      const second = seconds % 60
      return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    },
    cleanup() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      if (this.sceneEngine) {
        this.sceneEngine.stop()
        this.sceneEngine = null
      }
      if (this.audioCtx) {
        this.audioCtx.stop()
        this.audioCtx.destroy && this.audioCtx.destroy()
        this.audioCtx = null
      }
    }
  }
}
</script>

<style scoped>
.page-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at center, #07131f 0%, #03060b 42%, #000 100%);
}

.space-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(15, 28, 46, 0.8) 0%, rgba(2, 6, 12, 0.96) 56%, rgba(0, 0, 0, 1) 100%);
}

.earth-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.sleep-panel {
  position: absolute;
  right: 24rpx;
  bottom: 30rpx;
  z-index: 10;
  width: min(76vw, 360rpx);
  padding: 20rpx 18rpx 18rpx;
  border-radius: 28rpx;
  background: rgba(11, 24, 38, 0.72);
  border: 1px solid rgba(148, 191, 255, 0.46);
  box-shadow: 0 10rpx 26rpx rgba(14, 38, 56, 0.32);
  backdrop-filter: blur(12rpx);
}

.sound-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.sound-item {
  flex: 1 1 30%;
  min-width: 84rpx;
  padding: 10rpx 8rpx;
  border-radius: 14rpx;
  background: rgba(32, 48, 70, 0.54);
  border: 1px solid rgba(120, 149, 188, 0.34);
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
}

.sound-item.active {
  background: rgba(75, 117, 180, 0.58);
  border-color: rgba(188, 219, 255, 0.9);
  color: #fff;
  box-shadow: 0 0 8rpx rgba(161, 201, 255, 0.52);
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.main-action {
  justify-content: center;
}

.play-btn {
  width: 100%;
  min-height: 72rpx;
  border: none;
  border-radius: 18rpx;
  background: linear-gradient(135deg, rgba(108, 153, 240, 0.84), rgba(60, 105, 196, 0.76));
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.label,
.value {
  color: rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
}

.volume-row {
  gap: 12rpx;
}

.volume-slider {
  flex: 1;
}

.timer-row {
  flex-direction: column;
  align-items: flex-start;
}

.timer-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
}

.timer-item {
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  background: rgba(32, 48, 70, 0.6);
  border: 1px solid rgba(130, 160, 200, 0.4);
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.timer-item.active {
  background: rgba(91, 130, 191, 0.6);
  border-color: rgba(193, 223, 255, 0.85);
  color: #fff;
}

.status-panel {
  margin-top: 16rpx;
  padding-top: 12rpx;
  font-size: 20rpx;
  color: rgba(220, 235, 255, 0.88);
  border-top: 1px solid rgba(167, 190, 228, 0.28);
}
</style>
