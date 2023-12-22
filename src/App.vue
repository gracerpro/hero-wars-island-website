<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <div class="navbar-nav">
        <router-link to="/" class="nav-link">Гланая</router-link>
        <router-link to="/about" class="nav-link">О проекте</router-link>
      </div>
    </div>
  </nav>
  <router-view />
</template>
