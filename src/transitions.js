var TransitionTable = {
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
  "overcomingleaving_ruins": ["Soon after that time,\n\nI came to learn that I can look after myself."]
};

var audioTransitionTable = {
  "first_room": "burning",
  "second_room": "outdoors",
  "enter_ruins": "outdoors",
  "spectre_encounter": "indoors",
  "crouching3": "indoors",
  "interlude1": "outdoors",
  "psi3": "outdoors",
  "interlude2": "outdoors",
  "synthesis1": "indoors",
  "overcoming": "indoors",
  "leaving_ruins": "outdoors"
};

var visited = {};