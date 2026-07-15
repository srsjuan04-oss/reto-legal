(function () {
  "use strict";

  // Pega aquí la URL de implementación ("Web app URL") de tu Google Apps Script.
  // Ver instrucciones al final de este archivo / README para crearla.
  var SHEETS_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbyqn1K2jokc5wuyaH6lBRVzy1lEBgcPVZxv-fxi7UGNitUkxZskwb37kcVVMSkLf-hR/exec";

  var COUNTRIES = ["Estados Unidos","España","Panamá","México","Chile","Perú","Ecuador","Canadá","Reino Unido","Alemania","Italia","Francia","Australia","Argentina","Costa Rica","República Dominicana","Venezuela","Otro"];

  var COUNTRY_CODES = [
    {flag:"🇨🇴",code:"+57"},{flag:"🇺🇸",code:"+1"},{flag:"🇪🇸",code:"+34"},{flag:"🇵🇦",code:"+507"},
    {flag:"🇲🇽",code:"+52"},{flag:"🇨🇱",code:"+56"},{flag:"🇵🇪",code:"+51"},{flag:"🇪🇨",code:"+593"},
    {flag:"🇨🇦",code:"+1"},{flag:"🇬🇧",code:"+44"},{flag:"🇩🇪",code:"+49"},{flag:"🇮🇹",code:"+39"},
    {flag:"🇫🇷",code:"+33"},{flag:"🇦🇺",code:"+61"},{flag:"🇦🇷",code:"+54"},{flag:"🇨🇷",code:"+506"},
    {flag:"🇻🇪",code:"+58"}
  ];

  var QUESTIONS = [
    {id:"nombre", type:"text", label:"¿Cuál es tu nombre completo?", placeholder:"Nombre completo"},
    {id:"email", type:"email", label:"¿Cuál es tu correo electrónico?"},
    {id:"whatsapp", type:"phone", label:"¿Cuál es tu número de WhatsApp?"},
    {id:"pais", type:"select", label:"¿En qué país resides actualmente?"},
    {id:"situacion", type:"multi", label:"¿Cuál de estas situaciones describe mejor tu caso?", options:[
      "Vivo fuera de Colombia y tengo bienes o inversiones en el país.",
      "Recibo ingresos provenientes de Colombia.",
      "Envío dinero a cuentas bancarias de familiares o terceros en Colombia.",
      "Tengo cuentas bancarias o productos financieros en Colombia.",
      "Estoy pagando una vivienda o realizando una inversión en Colombia.",
      "La DIAN me notificó, requirió o me solicitó información.",
      "No sé si estoy obligado a declarar renta en Colombia.",
      "Ya sé que debo presentar mi declaración de renta como no residente."
    ]},
    {id:"dias", type:"single", label:"Durante el año que deseas revisar, ¿cuánto tiempo permaneciste en Colombia?", options:[
      "No estuve en Colombia.","Menos de 90 días.","Entre 90 y 182 días.","183 días o más.","No estoy seguro."
    ]},
    {id:"bienes", type:"multi", label:"¿Qué tipo de bienes, ingresos o movimientos tienes en Colombia?", options:[
      "Casa, apartamento, lote u otro inmueble.","Cuentas bancarias, CDT o inversiones.","Acciones o participación en empresas.",
      "Ingresos por arrendamientos.","Ingresos laborales o prestación de servicios.","Pensiones.","Venta de bienes o inversiones.",
      "Consignaciones o transferencias realizadas a familiares.","No tengo bienes ni ingresos, pero realizo movimientos bancarios.","Otro."
    ]},
    {id:"valor", type:"single", label:"Aproximadamente, ¿cuál fue el valor total de tus movimientos, ingresos o consignaciones en Colombia durante el año?", options:[
      "Menos de $30.000.000 COP.","Entre $30.000.000 y $70.000.000 COP.","Entre $70.000.001 y $150.000.000 COP.",
      "Entre $150.000.001 y $300.000.000 COP.","Más de $300.000.000 COP.","No conozco el valor.","Necesito que un profesional lo revise."
    ]},
    {id:"cuenta", type:"single", label:"Cuando envías dinero a Colombia, ¿a qué tipo de cuenta llega?", options:[
      "A una cuenta bancaria a mi nombre.","A la cuenta de mi mamá o papá.","A la cuenta de mi pareja.",
      "A la cuenta de un hermano u otro familiar.","A la cuenta de un amigo o tercero.","A una fiduciaria, constructora o empresa.","No envío dinero a Colombia."
    ]},
    {id:"documentos", type:"single", label:"¿Tienes documentos que permitan demostrar el origen y destino del dinero?", options:[
      "Sí, tengo todos los soportes.","Tengo algunos soportes.","No tengo los documentos organizados.",
      "No sé cuáles documentos necesito.","Necesito ayuda para reconstruir y organizar la información."
    ]},
    {id:"estado", type:"single", label:"¿En qué estado se encuentra actualmente tu situación tributaria?", options:[
      "Quiero saber si estoy obligado a declarar.","Necesito preparar mi declaración de renta.","Mi declaración está próxima a vencer.",
      "Tengo una declaración vencida o pendiente.","Debo corregir una declaración presentada.","Recibí una comunicación o requerimiento de la DIAN.",
      "También necesito revisar la situación del familiar que recibió el dinero."
    ]},
    {id:"urgencia", type:"single", label:"¿Qué tan pronto necesitas resolver tu caso?", options:[
      "Inmediatamente.","Durante los próximos 7 días.","Durante este mes.","Solo estoy recopilando información.","Todavía no he tomado una decisión."
    ]},
    {id:"ayuda", type:"single", label:"¿Qué tipo de ayuda estás buscando?", options:[
      "Una revisión para determinar si debo declarar.","La elaboración completa de mi declaración de renta.",
      "La declaración de renta y organización de soportes.","La revisión de consignaciones realizadas a familiares.",
      "La corrección de una declaración.","Atención de una comunicación o requerimiento de la DIAN.","Una asesoría general para hacerlo por mi cuenta."
    ]},
    {id:"contratar", type:"single", label:"¿Estás dispuesto a contratar un profesional para analizar y resolver tu caso?", options:[
      "Sí, deseo conocer el valor y comenzar cuanto antes.","Sí, primero quiero agendar una llamada.",
      "Depende del valor del servicio.","Solo busco información gratuita."
    ]}
  ];

  var FAQS = [
    {q:"¿Por vivir fuera de Colombia dejo de estar obligado a declarar?", a:"No necesariamente. La obligación debe analizarse considerando tu residencia fiscal, bienes, ingresos, inversiones y operaciones realizadas en Colombia."},
    {q:"¿El dinero que envío a un familiar se considera ingreso para esa persona?", a:"Depende de la finalidad de la transferencia y de los documentos que permitan demostrar su origen y destino. No todas las consignaciones tienen el mismo tratamiento."},
    {q:"¿Puedo realizar todo el proceso desde el exterior?", a:"Sí. La revisión, entrega de documentos y acompañamiento pueden realizarse virtualmente."},
    {q:"¿Qué sucede si no tengo organizados los soportes?", a:"Nuestro equipo te indicará cuáles documentos necesitas y revisará contigo las alternativas disponibles para respaldar las operaciones."},
    {q:"¿También pueden revisar la situación del familiar que recibió el dinero?", a:"Sí. Cuando los recursos fueron consignados en cuentas de terceros, puede ser necesario revisar el efecto tributario para ambas partes."},
    {q:"¿Pueden ayudarme si la declaración ya está vencida?", a:"Sí. Analizaremos la obligación pendiente, las posibles sanciones y el procedimiento que corresponda para regularizar tu situación."}
  ];

  // ---------- Multi-step form ----------
  var state = { step: 0, answers: {}, phoneCode: "+57", phoneNumber: "" };

  var els = {
    progressBar: document.getElementById("progress-bar"),
    stepCounter: document.getElementById("step-counter"),
    questionLabel: document.getElementById("question-label"),
    textWrap: document.getElementById("field-text-wrap"),
    textInput: document.getElementById("field-text"),
    emailWrap: document.getElementById("field-email-wrap"),
    emailInput: document.getElementById("field-email"),
    phoneWrap: document.getElementById("field-phone-wrap"),
    phoneCode: document.getElementById("field-phone-code"),
    phoneNumber: document.getElementById("field-phone-number"),
    selectWrap: document.getElementById("field-select-wrap"),
    select: document.getElementById("field-select"),
    choiceWrap: document.getElementById("field-choice-wrap"),
    choiceOptions: document.getElementById("field-choice-options"),
    lastStepNote: document.getElementById("last-step-note"),
    btnBack: document.getElementById("btn-back"),
    btnNext: document.getElementById("btn-next")
  };

  function isFilled(q) {
    var a = state.answers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    if (q.type === "phone") return !!state.phoneNumber.trim();
    return !!(a && String(a).trim());
  }

  function setAnswer(id, val) {
    state.answers[id] = val;
    render();
  }

  function toggleMulti(id, label) {
    var cur = Array.isArray(state.answers[id]) ? state.answers[id] : [];
    var idx = cur.indexOf(label);
    if (idx === -1) cur = cur.concat([label]);
    else cur = cur.filter(function (x) { return x !== label; });
    state.answers[id] = cur;
    render();
  }

  function goNext() {
    var q = QUESTIONS[state.step];
    if (!isFilled(q)) return;
    if (state.step === QUESTIONS.length - 1) {
      submitAndRedirect();
      return;
    }
    state.step = Math.min(state.step + 1, QUESTIONS.length - 1);
    render();
  }

  function buildPayload() {
    var whatsapp = (state.phoneCode + " " + state.phoneNumber).trim();
    return {
      fecha: new Date().toISOString(),
      nombre: state.answers.nombre || "",
      email: state.answers.email || "",
      whatsapp: whatsapp,
      pais: state.answers.pais || "",
      situacion: (state.answers.situacion || []).join(" | "),
      dias: state.answers.dias || "",
      bienes: (state.answers.bienes || []).join(" | "),
      valor: state.answers.valor || "",
      cuenta: state.answers.cuenta || "",
      documentos: state.answers.documentos || "",
      estado: state.answers.estado || "",
      urgencia: state.answers.urgencia || "",
      ayuda: state.answers.ayuda || "",
      contratar: state.answers.contratar || ""
    };
  }

  function submitAndRedirect() {
    els.btnNext.disabled = true;
    els.btnNext.textContent = "Enviando...";

    var redirected = false;
    function redirect() {
      if (redirected) return;
      redirected = true;
      window.location.href = "gracias.html";
    }

    if (!SHEETS_ENDPOINT_URL) {
      // No hay endpoint configurado todavía: se guarda localmente como respaldo
      // y se continúa el flujo normalmente.
      console.warn("SHEETS_ENDPOINT_URL no está configurado en js/form.js — el formulario no se está guardando.");
      redirect();
      return;
    }

    fetch(SHEETS_ENDPOINT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(buildPayload())
    }).then(redirect).catch(redirect);

    // Respaldo por si la petición se queda colgada.
    setTimeout(redirect, 4000);
  }

  function goBack() {
    state.step = Math.max(state.step - 1, 0);
    render();
  }

  function hideAllFields() {
    els.textWrap.style.display = "none";
    els.emailWrap.style.display = "none";
    els.phoneWrap.style.display = "none";
    els.selectWrap.style.display = "none";
    els.choiceWrap.style.display = "none";
    els.lastStepNote.style.display = "none";
  }

  function render() {
    var step = state.step;
    var q = QUESTIONS[step];
    var total = QUESTIONS.length;
    var filled = isFilled(q);
    var isLast = step === total - 1;

    els.progressBar.style.width = Math.round(((step + 1) / total) * 100) + "%";
    els.stepCounter.textContent = "Pregunta " + (step + 1) + " de " + total;
    els.questionLabel.textContent = q.label;

    hideAllFields();

    if (q.type === "text") {
      els.textWrap.style.display = "block";
      els.textInput.placeholder = q.placeholder || "";
      els.textInput.value = state.answers[q.id] || "";
    } else if (q.type === "email") {
      els.emailWrap.style.display = "block";
      els.emailInput.value = state.answers[q.id] || "";
    } else if (q.type === "phone") {
      els.phoneWrap.style.display = "block";
      els.phoneCode.value = state.phoneCode;
      els.phoneNumber.value = state.phoneNumber;
    } else if (q.type === "select") {
      els.selectWrap.style.display = "block";
      els.select.value = state.answers[q.id] || "";
    } else if (q.type === "single" || q.type === "multi") {
      els.choiceWrap.style.display = "block";
      renderChoiceOptions(q);
    }

    if (isLast) els.lastStepNote.style.display = "block";

    els.btnBack.style.display = step > 0 ? "inline-block" : "none";
    els.btnNext.disabled = !filled;
    els.btnNext.style.cursor = filled ? "pointer" : "not-allowed";
    els.btnNext.style.background = filled ? "#F5C400" : "#EFEAE0";
    els.btnNext.textContent = isLast ? "Enviar mi información" : "Siguiente";
  }

  function renderChoiceOptions(q) {
    els.choiceOptions.innerHTML = "";
    q.options.forEach(function (label) {
      var selected = q.type === "multi"
        ? (Array.isArray(state.answers[q.id]) && state.answers[q.id].indexOf(label) !== -1)
        : state.answers[q.id] === label;

      var row = document.createElement("div");
      row.className = "choice-option";
      row.style.cssText = "display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid " +
        (selected ? "#F5C400" : "#EAE4D4") + ";background:" + (selected ? "#FCF3D0" : "#fff") +
        ";border-radius:12px;cursor:pointer;";

      var mark = document.createElement("div");
      var shapeRadius = q.type === "multi" ? "6px" : "50%";
      mark.style.cssText = "width:20px;height:20px;flex:0 0 20px;border-radius:" + shapeRadius +
        ";border:2px solid " + (selected ? "#F5C400" : "#D8D2C2") +
        ";display:flex;align-items:center;justify-content:center;background:" + (selected ? "#F5C400" : "#fff") + ";";

      if (selected) {
        var dot = document.createElement("div");
        var dotRadius = q.type === "multi" ? "3px" : "50%";
        dot.style.cssText = "width:10px;height:10px;border-radius:" + dotRadius + ";background:#16130C;";
        mark.appendChild(dot);
      }

      var span = document.createElement("span");
      span.style.cssText = "font-size:15px;color:#3C3830;";
      span.textContent = label;

      row.appendChild(mark);
      row.appendChild(span);
      row.addEventListener("click", function () {
        if (q.type === "multi") toggleMulti(q.id, label);
        else setAnswer(q.id, label);
      });

      els.choiceOptions.appendChild(row);
    });
  }

  function initStaticFields() {
    // country select
    COUNTRIES.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      els.select.appendChild(opt);
    });
    // phone code select
    COUNTRY_CODES.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.flag + " " + c.code;
      els.phoneCode.appendChild(opt);
    });
  }

  els.textInput.addEventListener("input", function (e) {
    var q = QUESTIONS[state.step];
    state.answers[q.id] = e.target.value;
    els.btnNext.disabled = !isFilled(q);
    els.btnNext.style.cursor = isFilled(q) ? "pointer" : "not-allowed";
    els.btnNext.style.background = isFilled(q) ? "#F5C400" : "#EFEAE0";
  });

  els.emailInput.addEventListener("input", function (e) {
    var q = QUESTIONS[state.step];
    state.answers[q.id] = e.target.value;
    els.btnNext.disabled = !isFilled(q);
    els.btnNext.style.cursor = isFilled(q) ? "pointer" : "not-allowed";
    els.btnNext.style.background = isFilled(q) ? "#F5C400" : "#EFEAE0";
  });

  els.select.addEventListener("change", function (e) {
    var q = QUESTIONS[state.step];
    state.answers[q.id] = e.target.value;
    render();
  });

  els.phoneCode.addEventListener("change", function (e) {
    state.phoneCode = e.target.value;
  });

  els.phoneNumber.addEventListener("input", function (e) {
    state.phoneNumber = e.target.value;
    var filled = isFilled(QUESTIONS[state.step]);
    els.btnNext.disabled = !filled;
    els.btnNext.style.cursor = filled ? "pointer" : "not-allowed";
    els.btnNext.style.background = filled ? "#F5C400" : "#EFEAE0";
  });

  els.btnNext.addEventListener("click", goNext);
  els.btnBack.addEventListener("click", goBack);

  initStaticFields();
  render();

  // ---------- FAQ accordion ----------
  var faqList = document.getElementById("faq-list");
  var openFaq = -1;

  function renderFaq() {
    faqList.innerHTML = "";
    FAQS.forEach(function (f, i) {
      var isOpen = openFaq === i;
      var item = document.createElement("div");
      item.style.cssText = "background:#fff;border-radius:14px;padding:20px 24px;cursor:pointer;";

      var header = document.createElement("div");
      header.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:12px;";

      var qSpan = document.createElement("span");
      qSpan.style.cssText = "font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15.5px;";
      qSpan.textContent = f.q;

      var iconSpan = document.createElement("span");
      iconSpan.style.cssText = "font-size:20px;color:#8a6a00;flex:0 0 auto;";
      iconSpan.textContent = isOpen ? "−" : "+";

      header.appendChild(qSpan);
      header.appendChild(iconSpan);
      item.appendChild(header);

      if (isOpen) {
        var answer = document.createElement("p");
        answer.style.cssText = "font-size:14.5px;line-height:1.65;color:#5B5748;margin:14px 0 0;";
        answer.textContent = f.a;
        item.appendChild(answer);
      }

      item.addEventListener("click", function () {
        openFaq = isOpen ? -1 : i;
        renderFaq();
      });

      faqList.appendChild(item);
    });
  }

  renderFaq();
})();
