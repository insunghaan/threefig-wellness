export const profile = {
  name: "Kristen",
  calendarAge: 48,
  age: 44.7,
  previousAge: 45.3,
  ageChange: -0.6,
  ringBattery: 82,
  ringFinish: "Soft silver",
};
export const actions = [
  {
    id: "move",
    title: "Move before dinner.",
    detail:
      "A little movement in the late afternoon tends to suit your rhythm.",
    time: "LATE AFTERNOON",
  },
  {
    id: "coffee",
    title: "Keep coffee before 3.",
    detail: "Give your evenings a little more room to settle.",
    time: "BEFORE 3 PM",
  },
  {
    id: "rest",
    title: "Start winding down around 10.",
    detail:
      "A familiar bedtime has been helping your sleep feel more consistent.",
    time: "AROUND 10 PM",
  },
];
export const contributors = [
  {
    name: "Sleep",
    status: "Helping you",
    detail: "Your sleep has been more consistent.",
    note: "Your bedtime has stayed within a smaller window over the past few weeks.",
  },
  {
    name: "Heart",
    status: "Steady",
    detail: "Your resting pattern looks stable.",
    note: "Your resting heart rate and heart rate variability have stayed close to your personal baseline.",
  },
  {
    name: "Movement",
    status: "Worth noticing",
    detail: "You’ve been moving a little less lately.",
    note: "Your recent days include a little less movement than your longer-term pattern.",
  },
];
export const suggested = [
  { label: "Wake", time: "6:50 AM", start: 6.83, end: 7.3, tone: "morning" },
  { label: "Focus", time: "9–11:30 AM", start: 9, end: 11.5, tone: "day" },
  { label: "Move", time: "4–6 PM", start: 16, end: 18, tone: "afternoon" },
  { label: "Slow down", time: "9 PM", start: 21, end: 22.3, tone: "evening" },
  { label: "Sleep", time: "11:10 PM", start: 23.17, end: 30.83, tone: "night" },
];
export const actual = [
  { label: "Woke up", time: "7:15 AM", hour: 7.25 },
  { label: "Coffee", time: "8:20 AM", hour: 8.33 },
  { label: "Lunch", time: "12:40 PM", hour: 12.67 },
  { label: "Movement", time: "5:20 PM", hour: 17.33 },
  { label: "Dinner", time: "7:10 PM", hour: 19.17 },
  { label: "Wind down", time: "10 PM", hour: 22 },
  { label: "Sleep", time: "11:50 PM", hour: 23.83 },
];
export const pattern =
  "You’ve been waking more often on nights when you also report feeling warmer.";
export const demoJournal = {
  mood: "Okay",
  tags: ["Warm", "Restless"],
  note: "Woke up twice and felt warmer than usual.",
};
