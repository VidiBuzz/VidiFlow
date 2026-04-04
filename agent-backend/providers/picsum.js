module.exports = async function picsum(prompt, apiKey) {
  const seed = Math.abs(prompt.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  return { type: 'url', data: `https://picsum.photos/seed/${seed}/1280/720` };
};
