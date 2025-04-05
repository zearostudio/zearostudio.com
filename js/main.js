// Navegación suave para los enlaces
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const sectionId = this.getAttribute('href');
    const target = document.querySelector(sectionId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Opciones del Intersection Observer para animaciones de scroll
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Una vez que el elemento es visible, dejamos de observarlo
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observar todas las secciones y tarjetas
document.querySelectorAll('.section, .highlight, .service-card').forEach(element => {
  element.classList.add('hidden');
  observer.observe(element);
});

// Mapeo de IDs de secciones entre idiomas
const sectionIdMap = {
  'inicio': 'home',
  'nosotros': 'about',
  'servicios': 'services',
  'contacto': 'contact',
  'home': 'inicio',
  'about': 'nosotros',
  'services': 'servicios',
  'contact': 'contacto'
};

// Función para obtener la sección actual basada en la posición del scroll
function getCurrentSection() {
  const sections = document.querySelectorAll('.section');
  let currentSection = null;
  let minDistance = Infinity;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    if (distance < minDistance) {
      minDistance = distance;
      currentSection = section;
    }
  });

  return currentSection ? currentSection.id : null;
}

// Función para manejar el cambio de tema
function handleThemeToggle() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Función para manejar el cambio de idioma
function handleLanguageToggle() {
  const html = document.documentElement;
  const currentLang = html.getAttribute('data-lang');
  const newLang = currentLang === 'es' ? 'en' : 'es';
  
  // Guardar la posición actual del scroll
  const scrollPosition = window.scrollY;
  const currentSection = getCurrentSection();
  
  // Actualizar el idioma
  html.setAttribute('data-lang', newLang);
  html.setAttribute('lang', newLang);
  localStorage.setItem('lang', newLang);
  
  // Actualizar el hash de la URL si hay una sección actual
  if (currentSection) {
    const newSectionId = sectionIdMap[currentSection];
    if (newSectionId) {
      history.replaceState(null, null, `#${newSectionId}`);
    }
  }
  
  // Restaurar la posición del scroll después de un breve delay
  setTimeout(() => {
    window.scrollTo(0, scrollPosition);
  }, 50);
}

// Función para inicializar las preferencias del usuario
function initializePreferences() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const savedLang = localStorage.getItem('lang') || 'es';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-lang', savedLang);
  document.documentElement.setAttribute('lang', savedLang);
  
  // Actualizar el hash de la URL basado en el idioma guardado
  const currentHash = window.location.hash.slice(1);
  if (currentHash) {
    const mappedId = sectionIdMap[currentHash];
    if (mappedId) {
      history.replaceState(null, null, `#${mappedId}`);
    }
  }
}

// Función para manejar el envío del formulario
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  
  // Deshabilitar el botón y mostrar estado de carga
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="ri-loader-4-line"></i> Enviando...';
  
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Mostrar mensaje de éxito
    const successMessage = document.createElement('div');
    successMessage.className = 'form-response success';
    successMessage.textContent = form.getAttribute('data-lang') === 'es' ? 
      '¡Mensaje enviado con éxito!' : 
      'Message sent successfully!';
    
    form.appendChild(successMessage);
    form.reset();
    
    // Restaurar el botón
    submitButton.disabled = false;
    submitButton.textContent = form.getAttribute('data-lang') === 'es' ? 
      'Enviar mensaje' : 
      'Send message';
    
    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  })
  .catch(error => {
    // Mostrar mensaje de error
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-response error';
    errorMessage.textContent = form.getAttribute('data-lang') === 'es' ? 
      'Hubo un error al enviar el mensaje. Por favor, intente nuevamente.' : 
      'There was an error sending the message. Please try again.';
    
    form.appendChild(errorMessage);
    
    // Restaurar el botón
    submitButton.disabled = false;
    submitButton.textContent = form.getAttribute('data-lang') === 'es' ? 
      'Enviar mensaje' : 
      'Send message';
    
    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  });
}

// Función para actualizar los iconos de tema
function updateThemeIcons() {
  const themeToggle = document.querySelector('.theme-toggle');
  const currentTheme = document.documentElement.getAttribute('data-theme');
  
  if (themeToggle) {
    themeToggle.innerHTML = currentTheme === 'dark' 
      ? '<i class="ri-sun-line"></i>' 
      : '<i class="ri-moon-line"></i>';
  }
}

// Función para actualizar los iconos de idioma
function updateLanguageIcons() {
  const langSwitch = document.querySelector('.lang-switch');
  const currentLang = document.documentElement.getAttribute('data-lang');
  
  if (langSwitch) {
    langSwitch.innerHTML = currentLang === 'es' 
      ? '<i class="ri-translate-2"></i><span>EN</span>' 
      : '<i class="ri-translate-2"></i><span>ES</span>';
  }
}

// Función para ajustar automáticamente la altura del textarea
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar preferencias
  initializePreferences();
  
  // Actualizar iconos
  updateThemeIcons();
  updateLanguageIcons();
  
  // Configurar autoajuste de textareas
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    // Ajuste inicial
    autoResizeTextarea(textarea);
  });
  
  // Manejar envío de formularios
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
  
  // Manejar cambio de tema
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      handleThemeToggle();
      updateThemeIcons();
    });
  }
  
  // Manejar cambio de idioma
  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) {
    langSwitch.addEventListener('click', () => {
      handleLanguageToggle();
      updateLanguageIcons();
    });
  }
  
  // Manejar navegación suave
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Manejar hash de URL al cargar la página
  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    }
  }
});

// Añadir clase activa a los enlaces de navegación basado en la posición del scroll
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (pageYOffset >= sectionTop - 60) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});
  