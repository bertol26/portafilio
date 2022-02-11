const maquina4 = document.getElementById('description');

const maquinaEscribir3 = (text = '',tiempo = 2000, etiqueta = '') => {
    text = maquina4.innerHTML;
    let arrayCaracteres = text.split('')
    etiqueta.innerHTML = ''
    let i = 0
    let j = text.length
    let escribir = setInterval(function(){
      if (i === arrayCaracteres.length) {
        etiqueta.innerHTML = text.substring(0,j)
        
        if (j === 0) {
          etiqueta.innerHTML = ''
          i = 0
          j = text.length
        }
      } else {
        etiqueta.innerHTML += arrayCaracteres[i]
        i++
      }
    }, tiempo)
  }


  maquinaEscribir3("",50, maquina4);

  const navtoggle = document.querySelector('.icon-mobile');
  const navmenumobile = document.querySelector('.nav-list');

  navtoggle.addEventListener('click', () => {
    navmenumobile.classList.toggle('nav-visible');
  })