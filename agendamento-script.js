// Global variables
let currentStep = 1
let selectedService = ""
let selectedDate = ""
let selectedTime = ""
let currentMonth = new Date().getMonth()
let currentYear = new Date().getFullYear()

// Available time slots
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

// Unavailable dates (example)
const unavailableDates = ["2024-12-25", "2024-12-31", "2024-01-01"]

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  initializeNavbar()
  initializeForm()
  initializeCalendar()
  setupEventListeners()
  // Animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document.querySelectorAll(".info-card, .process-step").forEach((element, index) => {
    element.style.opacity = "0"
    element.style.transform = "translateY(30px)"
    element.style.transition = "all 0.6s ease"
    element.style.transitionDelay = `${index * 0.1}s`
    observer.observe(element)
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Auto-resize textarea
  const observacoesField = document.getElementById("observacoes")
  if (observacoesField) {
    observacoesField.addEventListener("input", function () {
      this.style.height = "auto"
      this.style.height = this.scrollHeight + "px"
    })
  }
})

// Navbar functionality
function initializeNavbar() {
  const navbar = document.getElementById("navbar")
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")
  const navLinks = document.querySelectorAll(".nav-link")

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      navToggle.classList.toggle("active")
    })
  }

  // Close mobile menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("active")
      if (navToggle) navToggle.classList.remove("active")
    })
  })

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled")
    } else {
      navbar.classList.remove("scrolled")
    }
  })
}

// Form initialization
function initializeForm() {
  showStep(1)
  setupPhoneMask()
  setupFormValidation()
}

// Setup event listeners
function setupEventListeners() {
  // Next step buttons
  document.querySelectorAll(".next-step").forEach((btn) => {
    btn.addEventListener("click", function () {
      const nextStep = Number.parseInt(this.dataset.next)
      if (validateCurrentStep()) {
        showStep(nextStep)
      }
    })
  })

  // Previous step buttons
  document.querySelectorAll(".prev-step").forEach((btn) => {
    btn.addEventListener("click", function () {
      const prevStep = Number.parseInt(this.dataset.prev)
      showStep(prevStep)
    })
  })

  // Service selection
  document.querySelectorAll(".service-option").forEach((option) => {
    option.addEventListener("click", function () {
      selectService(this.dataset.service, this)
    })
  })

  // Form submission
  const form = document.getElementById("booking-form")
  if (form) {
    form.addEventListener("submit", handleFormSubmission)
  }
}

// Show specific step
function showStep(step) {
  // Hide all steps
  document.querySelectorAll(".form-step").forEach((stepEl) => {
    stepEl.classList.remove("active")
  })

  // Show current step
  const currentStepEl = document.getElementById(`step-${step}`)
  if (currentStepEl) {
    currentStepEl.classList.add("active")
  }

  currentStep = step

  // Update summary if on review step
  if (step === 5) {
    updateBookingSummary()
  }

  // Scroll to top of form
  const formContainer = document.querySelector(".booking-form-container")
  if (formContainer) {
    formContainer.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// Validate current step
function validateCurrentStep() {
  clearErrors()
  let isValid = true

  switch (currentStep) {
    case 1:
      isValid = validatePersonalInfo()
      break
    case 2:
      isValid = validateServiceSelection()
      break
    case 3:
      isValid = validateDateTime()
      break
    case 4:
      // Additional info is optional
      isValid = true
      break
  }

  return isValid
}

// Validate personal information
function validatePersonalInfo() {
  let isValid = true

  const nome = document.getElementById("nome")
  const email = document.getElementById("email")
  const telefone = document.getElementById("telefone")

  if (!nome || !email || !telefone) return false

  const nomeValue = nome.value.trim()
  const emailValue = email.value.trim()
  const telefoneValue = telefone.value.trim()

  if (nomeValue.length < 2) {
    showError("nome", "Nome deve ter pelo menos 2 caracteres")
    isValid = false
  }

  if (!isValidEmail(emailValue)) {
    showError("email", "Digite um e-mail válido")
    isValid = false
  }

  if (telefoneValue.length === 0) {
    showError("telefone", "Digite um telefone")
    isValid = false
  }

  return isValid
}

// Validate service selection
function validateServiceSelection() {
  if (!selectedService) {
    showError("servico", "Selecione um tipo de serviço")
    return false
  }
  return true
}

// Validate date and time selection
function validateDateTime() {
  if (!selectedDate || !selectedTime) {
    showError("datetime", "Selecione uma data e horário")
    return false
  }
  return true
}

// Service selection
function selectService(service, element) {
  // Remove previous selection
  document.querySelectorAll(".service-option").forEach((opt) => {
    opt.classList.remove("selected")
  })

  // Add selection to clicked element
  element.classList.add("selected")
  selectedService = service

  const servicoInput = document.getElementById("servico-selecionado")
  if (servicoInput) {
    servicoInput.value = service
  }

  clearError("servico")
}

// Phone mask
function setupPhoneMask() {
  const phoneInput = document.getElementById("telefone")
  if (!phoneInput) return

  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    // Apply mask
    if (value.length <= 10) {
      if (value.length >= 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
      } else if (value.length >= 2) {
        value = value.replace(/(\d{2})(\d{0,4})/, "($1) $2")
      } else if (value.length >= 1) {
        value = value.replace(/(\d{0,2})/, "($1")
      }
    } else {
      value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
    }

    e.target.value = value
  })
}

// Form validation helpers
function setupFormValidation() {
  const nome = document.getElementById("nome")
  const email = document.getElementById("email")
  const telefone = document.getElementById("telefone")

  if (nome) {
    nome.addEventListener("input", function () {
      if (this.value.length >= 2) {
        clearError("nome")
      }
    })
  }

  if (email) {
    email.addEventListener("input", function () {
      if (isValidEmail(this.value)) {
        clearError("email")
      }
    })
  }

  if (telefone) {
    telefone.addEventListener("input", function () {
      if (this.value.trim().length > 0) {
        clearError("telefone")
      }
    })
  }
}

// Validation helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Error handling
function showError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + "-error")
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  }
}

function clearError(fieldId) {
  const errorElement = document.getElementById(fieldId + "-error")
  if (errorElement) {
    errorElement.style.display = "none"
  }
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((error) => {
    error.style.display = "none"
  })
}

// Calendar functionality
function initializeCalendar() {
  updateCalendar()

  const prevBtn = document.getElementById("prev-month")
  const nextBtn = document.getElementById("next-month")

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentMonth--
      if (currentMonth < 0) {
        currentMonth = 11
        currentYear--
      }
      updateCalendar()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentMonth++
      if (currentMonth > 11) {
        currentMonth = 0
        currentYear++
      }
      updateCalendar()
    })
  }
}

function updateCalendar() {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const calendarTitle = document.getElementById("calendar-title")
  if (calendarTitle) {
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`
  }

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const today = new Date()

  const calendarDays = document.getElementById("calendar-days")
  if (!calendarDays) return

  calendarDays.innerHTML = ""

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div")
    emptyDay.className = "calendar-day other-month"
    calendarDays.appendChild(emptyDay)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"
    dayElement.textContent = day

    const currentDate = new Date(currentYear, currentMonth, day)
    const dateString = formatDate(currentDate)

    // Check if date is today
    if (currentDate.toDateString() === today.toDateString()) {
      dayElement.classList.add("today")
    }

    // Check if date is in the past or unavailable
    if (currentDate < today || unavailableDates.includes(dateString)) {
      dayElement.classList.add("disabled")
    } else {
      dayElement.addEventListener("click", () => selectDate(dateString, dayElement))
    }

    calendarDays.appendChild(dayElement)
  }
}

function selectDate(date, element) {
  // Remove previous selection
  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.classList.remove("selected")
  })

  // Add selection to clicked element
  element.classList.add("selected")
  selectedDate = date

  const dataInput = document.getElementById("data-selecionada")
  if (dataInput) {
    dataInput.value = date
  }

  // Update time slots
  updateTimeSlots(date)
  clearError("datetime")
}

function updateTimeSlots(date) {
  const timeSlotsContainer = document.getElementById("time-slots")
  if (!timeSlotsContainer) return

  timeSlotsContainer.innerHTML = ""

  timeSlots.forEach((time) => {
    const timeSlot = document.createElement("div")
    timeSlot.className = "time-slot"
    timeSlot.textContent = time

    // Simulate some unavailable times
    const isUnavailable = Math.random() < 0.3 // 30% chance of being unavailable

    if (isUnavailable) {
      timeSlot.classList.add("unavailable")
    } else {
      timeSlot.addEventListener("click", () => selectTime(time, timeSlot))
    }

    timeSlotsContainer.appendChild(timeSlot)
  })
}

function selectTime(time, element) {
  // Remove previous selection
  document.querySelectorAll(".time-slot").forEach((slot) => {
    slot.classList.remove("selected")
  })

  // Add selection to clicked element
  element.classList.add("selected")
  selectedTime = time

  const horarioInput = document.getElementById("horario-selecionado")
  if (horarioInput) {
    horarioInput.value = time
  }

  clearError("datetime")
}

// Update booking summary
function updateBookingSummary() {
  const summary = document.getElementById("booking-summary")
  if (!summary) return

  const form = document.getElementById("booking-form")
  if (!form) return

  const formData = new FormData(form)

  const serviceNames = {
    "sob-medida": "Terno Sob Medida",
    ajustes: "Ajustes",
    consultoria: "Consultoria de Estilo",
    prova: "Prova de Terno",
  }

  const serviceName = serviceNames[selectedService] || "Não selecionado"
  const formattedDate = formatDateForDisplay(selectedDate)

  summary.innerHTML = `
        <h4>Resumo do Agendamento</h4>
        <div class="summary-item">
            <span class="summary-label">Nome:</span>
            <span class="summary-value">${formData.get("nome") || ""}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">E-mail:</span>
            <span class="summary-value">${formData.get("email") || ""}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Telefone:</span>
            <span class="summary-value">${formData.get("telefone") || ""}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Serviço:</span>
            <span class="summary-value">${serviceName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Data:</span>
            <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Horário:</span>
            <span class="summary-value">${selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Ocasião:</span>
            <span class="summary-value">${formData.get("ocasiao") || "Não informado"}</span>
        </div>
    `
}

// Form submission
async function handleFormSubmission(e) {
  e.preventDefault()

  console.log("Form submitted!") // Debug

  const submitBtn = document.getElementById("submit-booking")
  if (!submitBtn) return

  const btnText = submitBtn.querySelector(".btn-text")
  const btnLoading = submitBtn.querySelector(".btn-loading")

  // Show loading state
  submitBtn.disabled = true
  if (btnText) btnText.style.display = "none"
  if (btnLoading) btnLoading.style.display = "flex"

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Hide form and show success message
    const bookingForm = document.querySelector(".booking-form")
    if (bookingForm) {
      bookingForm.style.display = "none"
    }

    showSuccessMessage()
  } catch (error) {
    console.error("Erro ao agendar:", error)
    alert("Erro ao confirmar agendamento. Tente novamente.")
  } finally {
    // Reset button state
    submitBtn.disabled = false
    if (btnText) btnText.style.display = "flex"
    if (btnLoading) btnLoading.style.display = "none"
  }
}

// Show success message
function showSuccessMessage() {
  const successMessage = document.getElementById("success-message")
  const successDetails = document.getElementById("success-details")

  if (!successMessage || !successDetails) return

  const form = document.getElementById("booking-form")
  if (!form) return

  const formData = new FormData(form)

  const serviceNames = {
    "sob-medida": "Terno Sob Medida",
    ajustes: "Ajustes",
    consultoria: "Consultoria de Estilo",
    prova: "Prova de Terno",
  }

  const serviceName = serviceNames[selectedService]
  const formattedDate = formatDateForDisplay(selectedDate)

  successDetails.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Protocolo:</span>
            <span class="summary-value">#${generateProtocol()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Cliente:</span>
            <span class="summary-value">${formData.get("nome") || ""}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Serviço:</span>
            <span class="summary-value">${serviceName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Data e Horário:</span>
            <span class="summary-value">${formattedDate} às ${selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Endereço:</span>
            <span class="summary-value">Rua da Elegância, 123 - Centro, São Paulo</span>
        </div>
    `

  successMessage.style.display = "block"
  successMessage.scrollIntoView({ behavior: "smooth", block: "center" })
}

// Helper functions
function formatDate(date) {
  return date.toISOString().split("T")[0]
}

function formatDateForDisplay(dateString) {
  if (!dateString) return "Não selecionado"

  const date = new Date(dateString + "T00:00:00")
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return date.toLocaleDateString("pt-BR", options)
}

function generateProtocol() {
  return "ES" + Date.now().toString().slice(-6)
}
