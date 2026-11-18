// তারিখের সহায়ক ফাংশন। "YYYY-MM-DD" ইনপুটকে দুপুর ১২টা ধরা হয়,
// যাতে সময় অঞ্চলের কারণে তারিখ এক দিন সরে না যায়।

export function parseDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(date) {
  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}