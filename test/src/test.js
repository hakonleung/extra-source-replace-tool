const img = document.createElement('img')
img.src = 'https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'

window.addEventListener('load', () => {
  document.body.append(img)
})