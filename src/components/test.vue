<template>
  <div class="relative">
    <div class="relative video-container">
      <span class="absolute z-10 text-xs text-white top-3 left-4">Sélectionner le cadre du streamer</span>
      <video
        ref="video1"
        :src="videoSource1"
        autoplay
        loop
        muted
        style="width: 100%; height: 100%;"
        @loadedmetadata="handleVideoLoad1"
      ></video>
      <div
        id="crop-container1"
        class="absolute z-50"
        :style="{ width: videoWidth1 + 'px', height: videoHeight1 + 'px' }"
      >
        <canvas ref="cropperCanvas1"></canvas>
      </div>
    </div>
    <div class="relative video-container">
      <span class="absolute z-10 text-xs text-white top-3 left-4">Sélectionnez le cadre de contenu souhaité</span>
      <video
        ref="video2"
        :src="videoSource2"
        autoplay
        loop
        muted
        style="width: 100%; height: 100%;"
        @loadedmetadata="handleVideoLoad2"
      ></video>
      <div
        id="crop-container2"
        class="absolute z-50"
        :style="{ width: videoWidth2 + 'px', height: videoHeight2 + 'px' }"
      >
        <canvas ref="cropperCanvas2"></canvas>
      </div>
    </div>
    <div class="relative video-container">
      <span class="absolute text-white z-10 text-xs top-3 left-4 border px-2 py-0.5">Résultat Final</span>
      <video
        ref="video_final"
        :src="videoSourceFinal"
        autoplay
        loop
        muted
        
      >

      </video>
    </div>
  </div>
  <div class="absolute block p-8">
    <div>
      <label for="file_input" class="block mb-2 text-sm font-medium">Sélectionner le fichier vidéo (.mp4)</label>
      <input
        type="file"
        accept=".mp4"
        @change="changeVideo"
        name="file_input"
        id="file_input"
        class="block w-full text-sm border border-gray-200 rounded-lg shadow-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-nonefile:bg-gray-50 file:border-0 file:bg-gray-100 file:me-4 file:py-3 file:px-4"
      >
    </div>
    <div id="coordinates-display1" class="mt-4 text-xs text-gray-500" v-html="coordinatesDisplay1"></div>
    <div id="coordinates-display2" class="mt-4 text-xs text-gray-500" v-html="coordinatesDisplay2"></div>
    <div class="mt-4">
      <label for="aspectratio_container1" class="block mb-2 text-sm font-medium">Ratio de la première vidéo</label>
      <input
        v-model="aspectRatio1"
        type="text"
        id="aspectratio_container1"
        class="block w-full px-4 py-3 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
        placeholder="Ratio"
      >
    </div>
    <div class="mt-4">
      <label for="aspectratio_container2" class="block mb-2 text-sm font-medium">Ratio de la deuxième vidéo</label>
      <input
        v-model="aspectRatio2"
        type="text"
        id="aspectratio_container2"
        class="block w-full px-4 py-3 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
        placeholder="Ratio"
      >
    </div>
    <button
      @click="startTranscoding"
      :disabled="transcodingInProgress"
      v-text = "transcodingInProgress ? 'Génération en cours...' : 'Générer la vidéo Tiktok'"
      class="inline-flex items-center justify-center w-full px-4 py-3 mt-4 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg gap-x-2 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
    >
    </button>
  </div>
</template>
<script lang="ts">
  import Cropper from 'cropperjs';
  import '../../src/assets/cropper.css';
  import { FFmpeg } from '@ffmpeg/ffmpeg'
  import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types'
  import { fetchFile, toBlobURL } from '@ffmpeg/util'
  export default {
    data() {
      return {
        videoSource1: 'samplewebm.webm',
        videoSource2: 'samplewebm.webm',
        aspectRatio1: '16/9',
        aspectRatio2: '7/9',
        coordinatesDisplay1: '',
        coordinatesDisplay2: '',
        cropper1: null,
        cropper2: null,
        videoWidth1: 1000,
        videoHeight1: 562.5,
        videoWidth2: 1000,
        videoHeight2: 562.5,
        transcodingInProgress: false,
        videoSourceFinal: '',
        logs: null,
      };
    },
    methods: {
      async startTranscoding() {
        this.transcodingInProgress = true;
        try {
          await this.transcode();
        } finally {
          this.transcodingInProgress = false;
        }
      },
      async transcode() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm'
        const ffmpeg = new FFmpeg()
        ffmpeg.on('log', ({ message: msg }: LogEvent) => {
          console.info(msg)
        })
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
        })
        await ffmpeg.writeFile('video1.mp4', await fetchFile(this.videoSource1))
        await ffmpeg.writeFile('video2.mp4', await fetchFile(this.videoSource2))
        const { width: width1, height: height1, x: x1, y: y1 } = this.getCropValues1();
        const { width: width2, height: height2, x: x2, y: y2 } = this.getCropValues2();
        await ffmpeg.exec(['-i', 'video1.mp4', '-filter:v', `crop=${width1}:${height1}:${x1}:${y1}`, 'output1.mp4']);
        await ffmpeg.exec(['-i', 'video2.mp4', '-filter:v', `crop=${width2}:${height2}:${x2}:${y2}`, 'output2.mp4']);
        const data1 = await ffmpeg.readFile('output1.mp4')
        const data2 = await ffmpeg.readFile('output2.mp4')
        this.videoSource1 = URL.createObjectURL(new Blob([(data1 as Uint8Array).buffer], { type: 'video/mp4' }))
        this.videoSource2 = URL.createObjectURL(new Blob([(data2 as Uint8Array).buffer], { type: 'video/mp4' }))


        // concatenate videos


      },
      getCropValues1() {
        const cropData = this.cropper1.getData(true);
        return {
          width: cropData.width,
          height: cropData.height,
          x: cropData.x,
          y: cropData.y
        }
      },
      getCropValues2() {
        const cropData = this.cropper2.getData(true);
        return {
          width: cropData.width,
          height: cropData.height,
          x: cropData.x,
          y: cropData.y
        }
      },
      handleVideoLoad1() {
        this.updateCropper1();
      },
      handleVideoLoad2() {
        this.updateCropper2();
      },
      updateCropper1() {
        const video = this.$refs.video1;
        const cropperCanvas = this.$refs.cropperCanvas1;
        this.videoWidth1 = video.videoWidth;
        this.videoHeight1 = video.videoHeight;
        cropperCanvas.width = this.videoWidth1;
        cropperCanvas.height = this.videoHeight1;
        if (this.cropper1) {
          this.cropper1.destroy();
        }
        this.cropper1 = new Cropper(cropperCanvas, {
          background: false,
          modal: false,
          highlight: false,
          viewMode: 1,
          zoomOnWheel: false,
          aspectRatio: eval(this.aspectRatio1),
        });
        cropperCanvas.addEventListener('crop', this.updateCoordinates1);
      },
      updateCropper2() {
        const video = this.$refs.video2;
        const cropperCanvas = this.$refs.cropperCanvas2;
        this.videoWidth2 = video.videoWidth;
        this.videoHeight2 = video.videoHeight;
        cropperCanvas.width = this.videoWidth2;
        cropperCanvas.height = this.videoHeight2;
        if (this.cropper2) {
          this.cropper2.destroy();
        }
        this.cropper2 = new Cropper(cropperCanvas, {
          background: false,
          modal: false,
          highlight: false,
          viewMode: 1,
          zoomOnWheel: false,
          aspectRatio: eval(this.aspectRatio2),
        });
        cropperCanvas.addEventListener('crop', this.updateCoordinates2);
      },
      updateCoordinates1(data) {
        const { detail } = data;
        const { x, y, width, height } = detail;
        this.coordinatesDisplay1 = `x: ${x} <br> y: ${y} <br> width: ${width} <br> height: ${height}`;
      },
      updateCoordinates2(data) {
        const { detail } = data;
        const { x, y, width, height } = detail;
        this.coordinatesDisplay2 = `x: ${x} <br> y: ${y} <br> width: ${width} <br> height: ${height}`;
      },
      changeVideo(event) {
        const file = event.target.files[0];
        if (file) {
          this.videoSource1 = URL.createObjectURL(file);
          this.videoSource2 = URL.createObjectURL(file);
        }
      },
    },
    watch: {
      aspectRatio1(newRatio) {
        const [numerator, denominator] = newRatio.split('/');
        if (numerator && denominator) {
          this.cropper1.setAspectRatio(numerator / denominator);
        }
      },
      aspectRatio2(newRatio) {
        const [numerator, denominator] = newRatio.split('/');
        if (numerator && denominator) {
          this.cropper2.setAspectRatio(numerator / denominator);
        }
      },
    },
  };
</script>
<style>
  .video-container {
    display: inline-block;
    margin-right: 20px;
  }
  #crop-container1,
  #crop-container2 {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
  }
</style>
