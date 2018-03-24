var LocTable = {
  "en-ca":
  {
    "lang_name": "English",

    "press_start": "Press any button to start.",
    "first_room": ["Fires and rioting behind me,\n\nI fled the remains of my home alone in the middle of the night.",
                   "Our village no longer tolerated those like my father,\n\nwho wedded my mother from the Tribe of the Beasts.",
                   "After that violent night,\n\nI never saw them again."],
    "first_roomsecond_room": ["I fled into the woods, which held an old ruin.\n\nStories say it holds a spectre that can speak with the dead."],
    "enter_ruinsspectre_encounter": ["Here I felt my flesh become the food of my fears."],
    "spectre_encountercrouching1": ["\"I'm cold.\""],
    "crouching1crouching2": ["\"I'm afraid.\""],
    "crouching2crouching3": ["\"I'm alone.\""],
    "interlude1psi1": ["\"There must be something wrong with me.\""],
    "interlude2synthesis1": ["\"Not a single person cares about me.\""],
    "systhesis4interlude3": ["All I could feel in those moments,\n\nwas how cruel I thought the world had become to me."],
    "the_goddessinterlude6": ["\"I'm going to be okay.\""],
    "interlude6overcoming": ["\"I'm worth knowing,\n\neven if that's not known yet.\""],
    "overcomingleaving_ruins": ["Soon after that time,\n\nI came to learn that I can look after myself."],

    "run_away": "Run away.",
    "dont_be_seen": "Don't be seen.",
    "tut_look": "Use <RIGHTSTICK> to look around.",
    "tut_crouch": "Hold <CROUCH> to stay low. ",
    "tut_psi": "Hold <PSI> to focus your mind.",

    "speech": ["I am the last of the caretakers of old,\n\nwho once built and walked along these halls.",
               "From the ethers I can hear the voices of those who have departed.\n\nLike the stars above, they call to this world from afar.",
               "Child, know that the ones you miss love you dearly.\n\nDo not doubt the warmth you have brought them.",
               "Your mother and father want you to know not only that,\n\nbut also for you to remember that in times of need.",
               "As you go along in your journey,\n\nremember to care for yourself and nourish your kindness."],

     "credit_title": "Spectres of the Cold",
     "credit_art": "Original Concept Art",
     "credit_production": "General Production",
     "credit_playtesting": "Playtesting",
     "credit_dev_sup": "Development Support",
     "credit_audio": "Audio",
     "credit_loc": "Localization",
     "credit_ty": "Special Thanks",
     "credit_link": "danbolt.itch.io"
  },
  "es-mx":
  {
    "lang_name": "Español",

    "press_start": "Presiona cualquier botón para empezar.",
    "first_room": ["Fuego y disturbios detrás de mí,\n\nhuí de los restos de mi hogar solo, a la mitad de la noche.",
                   "Nuestra aldea dejó de tolerar a aquellos como mi padre,\n\nquien se casó con mi madre de la Tribu de las Bestias.",
                   "Después de esa violenta noche,\n\nno volví a verlos."],
    "first_roomsecond_room": ["Huí al bosque, donde hay una vieja ruina.\n\nLos cuentos dicen que ahí habita un espectro que puede hablar con los muertos."],
    "enter_ruinsspectre_encounter": ["Aquí sentí a mi carne convertirse en el alimento de mis miedos."],
    "spectre_encountercrouching1": ["\"Tengo frío.\""],
    "crouching1crouching2": ["\"Tengo miedo.\""],
    "crouching2crouching3": ["\"Estoy solo.\""],
    "interlude1psi1": ["\"Debe haber algo mal conmigo.\""],
    "interlude2synthesis1": ["\"No le importo a una sola persona.\""],
    "systhesis4interlude3": ["Todo lo que podía sentir en esos momentos\n\nera qué tan cruel pensaba que el mundo se había vuelto conmigo."],
    "the_goddessinterlude6": ["\"Voy a estar bien.\""],
    "interlude6overcoming": ["\"Vale la pena conocerme,\n\nincluso si eso aún no se conoce.\""],
    "overcomingleaving_ruins": ["Poco después de ese tiempo,\n\nme dí cuenta de que sí puedo cuidarme."],

    "run_away": "Huye.",
    "dont_be_seen": "Que no te vean.",
    "tut_look": "Mantén presionado <RIGHTSTICK> para mirar.",
    "tut_crouch": "Mantén presionado <CROUCH> para agacharte.",
    "tut_psi": "Mantén presionado <PSI> para concentrar tu mente.",

    "speech": ["Soy uno de los guardianes de antaño,\n\nque alguna vez construyeron y caminaron por estos pasillos.",
               "Desde los éteres puedo escuchar las voces de aquellos que se han ido.\n\nComo las estrellas sobre nosotros, ellos llaman a este mundo desde lejos.",
               "Pequeño, debes saber que aquellos que extrañas te aman profundamente.\n\nNo dudes de el calor que les has dado.",
               "Tus padres quieren que sepas no sólo eso,\n\nsino que también lo recuerdes en tiempos difíciles.",
               "Conforme avances en tu viaje,\n\nrecuerda cuidarte y nutrir tu amabilidad."],

     "credit_title": "Spectres of the Cold",
     "credit_art": "Arte Conceptual Original",
     "credit_production": "Producción General",
     "credit_playtesting": "Playtesting",
     "credit_dev_sup": "Soporte de Desarrollo",
     "credit_audio": "Audio",
     "credit_loc": "Traducción",
     "credit_ty": "Agradecimientos Especiales",
     "credit_link": "danbolt.itch.io"
  }/*,
  "ko":
  {
    "lang_name":"TEST_KOREAN"
  },
  "jp":
  {
    "lang_name":"TEST_JAPANESE"
  },
  "fr-fr":
  {
    "lang_name":"TEST_FRENCH"
  }
  */
};

var defaultLocale = 'en-ca';
var currentLocale = defaultLocale;
var loc = function(key) {
  return LocTable[currentLocale][key];
}