let availableVoices = [];

// Load voices and store them
export function loadVoices() {
  const updateVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };

  window.speechSynthesis.onvoiceschanged = updateVoices;
  updateVoices(); // in case voices are already available
}

// Call this at app start






const digitWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

// speak full number
function numberToWords(num) {
  const belowTwenty = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (num < 20) return belowTwenty[num];
  const tenPart = Math.floor(num / 10);
  const unitPart = num % 10;
  return `${tens[tenPart]}${unitPart ? "-" + belowTwenty[unitPart] : ""}`;
}


//speaking any text
export function speak(text, voiceType, rate) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  // Pick voice based on keyword (e.g., "female" or "male")
  const voice = availableVoices.find(v =>
    v.name.toLowerCase().includes(voiceType)
  );

  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

//  speak each digit with full num
export function speakNumber(num, voiceType, rate) {
  if (!window.speechSynthesis) return;

  let speechText = "";

  if (num < 10) {
    speechText = `Single number ${digitWords[num]}`;
  } else {
    const digits = String(num).split("").map(d => digitWords[parseInt(d)]).join(" ");
    const fullName = numberToWords(num);
    speechText = `${digits}, ${fullName}`;
  }

  const utter = new SpeechSynthesisUtterance(speechText);
  utter.rate = rate;
  const voice = availableVoices.find(v => v.name.toLowerCase().includes(voiceType.toLowerCase()));
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}
