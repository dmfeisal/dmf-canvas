<script setup>
import {ref} from 'vue';
import CanvasEmbed from './CanvasEmbed.vue';
const visible=ref({A:true,B:true});
const renders=ref(0);
const development=import.meta.env.DEV;
</script>

<template>
  <main data-framework="vue" :data-development="String(development)">
    <h1>Canvas in Vue</h1>
    <p>Two canvases installed from the packed library. Save a board file before hiding its canvas; showing it creates a fresh instance.</p>
    <div class="example-actions">
      <button v-for="name in ['A','B']" :key="name" :data-toggle="name" @click="visible[name]=!visible[name]">{{visible[name]?'Hide':'Show'}} canvas {{name}}</button>
      <button data-rerender @click="renders++">Update parent</button>
    </div>
    <output class="framework-state" data-renders>Parent updates: {{renders}}</output>
    <div class="consumers"><template v-for="name in ['A','B']" :key="name"><CanvasEmbed v-if="visible[name]" :name="name"/></template></div>
  </main>
</template>
