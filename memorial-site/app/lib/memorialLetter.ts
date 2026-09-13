/** The Korean original is archival content. Do not replace it with a translation. */
export const memorialLetter = {
  ko: [
    '그날의 진동과 울림은 아직도 제 가슴속에 남아 있습니다.',
    '어렸을 때, 눈앞에 있던 그 별은 너무나 든든했습니다.\n언제나 그 자리에 있을 것 같았고, 그 빛 아래에서 저는 자랐습니다.',
    '하지만 시간이 흐르면서 그 든든함이 때로는 벽처럼 느껴지기도 했습니다.\n그 벽의 그림자 속에 제가 갇혀 있는 것 같았고,\n도망치고 싶었고, 벗어나고 싶었습니다.',
    '그러다 정신을 차리고 보니,\n별은 이미 떨어져 있었습니다.',
    '아쉬움보다 먼저 밀려온 것은 허망함이었습니다.\n아직 하지 못한 이야기들이 너무 많이 남아 있었고,\n앞으로도 기회가 있을 거라 생각했던 말들은 끝내 전하지 못했습니다.',
    '한참을 울고 난 뒤 다시 앞을 바라보았습니다.',
    '그제야 조금씩 알 것 같았습니다.\n아버지가 제 앞에 남긴 것은 벽이 아니었다는 것을.',
    '별이 떨어진 자리에는\n그가 걸어온 흔적과,\n그 빛을 따라갈 수 있는 길이 남아 있었습니다.',
    '이제 저는 그 흔적을 마음에 담고 아버지를 기억하려 합니다.',
    '저뿐만 아니라,\n아버지의 친구들,\n제자들,\n동료들,\n그리고 아버지를 기억하는 모든 사람들과 함께.',
    '그가 어떤 사람이었는지,\n누구에게 어떤 기억으로 남아 있는지,\n서로의 이야기를 통해 오래 기억하고 싶습니다.',
    '별은 떨어졌지만,\n그 빛은 아직 우리 곁에 남아 있습니다.',
  ],
  en: [
    'The vibration and resonance of that day are still with me.',
    'As a child, I felt so secure in the presence of that star.\nI thought it would always be there. I grew up in its light.',
    'But as time passed, that same strength sometimes felt like a wall.\nI felt caught in its shadow.\nI wanted to escape, to find my own way beyond it.',
    'Then, when I finally looked up,\nthe star had already fallen.',
    'Before regret came a sense of emptiness.\nThere was still so much we had not said to each other.\nThe words I thought there would always be time for were left unspoken.',
    'After a long time in tears, I looked ahead again.',
    'Only then did I begin to understand:\nwhat my father had left before me was not a wall.',
    'Where the star had fallen,\nthere were traces of the life he had lived,\nand a path along which I could follow his light.',
    'Now I want to carry those traces with me and remember my father.',
    'Not alone, but with his friends,\nhis students, his colleagues,\nand everyone who remembers him.',
    'Through one another’s stories,\nI hope we can remember the person he was\nand the different ways he remains in each of our lives.',
    'The star has fallen,\nbut its light is still here with us.',
  ],
};

export const LETTER_SEEN_KEY = 'memorial-son-letter-seen-v1';
export function letterWasDismissed(storage: Pick<Storage, 'getItem'>) {
  try { return storage.getItem(LETTER_SEEN_KEY) === '1'; } catch { return false; }
}
export function rememberLetterDismissal(storage: Pick<Storage, 'setItem'>) {
  try { storage.setItem(LETTER_SEEN_KEY, '1'); } catch { /* Privacy modes must never prevent closing. */ }
}
