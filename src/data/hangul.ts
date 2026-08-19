export interface HangulLetter {
  char: string
  name: string
  roman: string
  tip: string
  example?: { hangul: string; meaning: string }
}

export interface HangulQuizItem {
  prompt: string
  promptKind: 'char' | 'name' | 'sound'
  answer: string
  options: string[]
}

export interface HangulLesson {
  id: string
  order: number
  title: string
  subtitle: string
  body: string
  letters: HangulLetter[]
  quiz: HangulQuizItem[]
}

export const HANGUL_LESSONS: HangulLesson[] = [
  {
    id: 'consonants-1',
    order: 1,
    title: '基本辅音（一）',
    subtitle: 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ',
    body: '韩语辅音写在音节的左边或上方。先认这六个最常用的基本辅音，它们像积木一样，后面会和元音拼在一起。',
    letters: [
      { char: 'ㄱ', name: '기역', roman: 'g/k', tip: '像没封口的「工」，词首接近 g。', example: { hangul: '가방', meaning: '包' } },
      { char: 'ㄴ', name: '니은', roman: 'n', tip: '像「L」躺着，舌头抵住上齿龈。', example: { hangul: '나무', meaning: '树' } },
      { char: 'ㄷ', name: '디귿', roman: 'd/t', tip: '比 ㄴ 多一横，词首接近 d。', example: { hangul: '다리', meaning: '腿 / 桥' } },
      { char: 'ㄹ', name: '리을', roman: 'r/l', tip: '词中接近 r，词尾接近 l。', example: { hangul: '라면', meaning: '拉面' } },
      { char: 'ㅁ', name: '미음', roman: 'm', tip: '封口的方框，双唇音。', example: { hangul: '마음', meaning: '心' } },
      { char: 'ㅂ', name: '비읍', roman: 'b/p', tip: 'ㅁ 下面再加一竖，词首接近 b。', example: { hangul: '밥', meaning: '饭' } },
    ],
    quiz: [
      { prompt: 'ㄱ', promptKind: 'char', answer: 'g/k', options: ['g/k', 'n', 'm', 'b/p'] },
      { prompt: '니은', promptKind: 'name', answer: 'ㄴ', options: ['ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'] },
      { prompt: 'ㅂ', promptKind: 'char', answer: 'b/p', options: ['g/k', 'd/t', 'b/p', 'm'] },
      { prompt: 'ㄹ', promptKind: 'char', answer: 'r/l', options: ['n', 'r/l', 'd/t', 'g/k'] },
    ],
  },
  {
    id: 'consonants-2',
    order: 2,
    title: '基本辅音（二）',
    subtitle: 'ㅅ ㅇ ㅈ ㅊ',
    body: 'ㅅ 像牙齿，ㅇ 在词首不发音，ㅈ / ㅊ 是舌面音。ㅇ 后面会作为韵尾发 ng。',
    letters: [
      { char: 'ㅅ', name: '시옷', roman: 's', tip: '像人的牙齿，后接 ㅣ 时接近 sh。', example: { hangul: '사람', meaning: '人' } },
      { char: 'ㅇ', name: '이응', roman: 'silent / ng', tip: '词首占位不发音，作韵尾是 ng。', example: { hangul: '아이', meaning: '孩子' } },
      { char: 'ㅈ', name: '지읒', roman: 'j', tip: 'ㅅ 下面加一横。', example: { hangul: '주스', meaning: '果汁' } },
      { char: 'ㅊ', name: '치읓', roman: 'ch', tip: 'ㅈ 上面再加一点，送气。', example: { hangul: '차', meaning: '茶 / 车' } },
    ],
    quiz: [
      { prompt: 'ㅇ 在音节开头', promptKind: 'sound', answer: '不发音', options: ['ng', '不发音', 'o', 'g'] },
      { prompt: 'ㅅ', promptKind: 'char', answer: 's', options: ['s', 'j', 'ch', 'h'] },
      { prompt: '치읓', promptKind: 'name', answer: 'ㅊ', options: ['ㅈ', 'ㅊ', 'ㅅ', 'ㅇ'] },
      { prompt: 'ㅈ', promptKind: 'char', answer: 'j', options: ['s', 'ch', 'j', 'n'] },
    ],
  },
  {
    id: 'consonants-3',
    order: 3,
    title: '基本辅音（三）',
    subtitle: 'ㅋ ㅌ ㅍ ㅎ',
    body: '送气音：比 ㄱㄷㅂ 多一口气。ㅎ 像「o」上加点，是 h。到这里，14 个基本辅音就齐了。',
    letters: [
      { char: 'ㅋ', name: '키읔', roman: 'k', tip: 'ㄱ 加一横，明显送气。', example: { hangul: '카메라', meaning: '相机' } },
      { char: 'ㅌ', name: '티읕', roman: 't', tip: 'ㄷ 加一横。', example: { hangul: '토요일', meaning: '星期六' } },
      { char: 'ㅍ', name: '피읖', roman: 'p', tip: '像两横夹一框，双唇送气。', example: { hangul: '커피', meaning: '咖啡' } },
      { char: 'ㅎ', name: '히읗', roman: 'h', tip: '轻轻出气，像哈气。', example: { hangul: '하나', meaning: '一' } },
    ],
    quiz: [
      { prompt: 'ㅋ', promptKind: 'char', answer: 'k', options: ['g/k', 'k', 'h', 't'] },
      { prompt: '히읗', promptKind: 'name', answer: 'ㅎ', options: ['ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] },
      { prompt: 'ㅍ', promptKind: 'char', answer: 'p', options: ['b/p', 'p', 'm', 't'] },
      { prompt: 'ㅌ', promptKind: 'char', answer: 't', options: ['d/t', 't', 's', 'ch'] },
    ],
  },
  {
    id: 'vowels-1',
    order: 4,
    title: '基本元音（一）',
    subtitle: 'ㅏ ㅑ ㅓ ㅕ ㅗ',
    body: '元音写在辅音右边或下边。竖线类在右边，横线类在下边。ㅏ 是「啊」，ㅓ 口型更圆、更靠后。',
    letters: [
      { char: 'ㅏ', name: '아', roman: 'a', tip: '竖线右边一点，嘴巴张大。', example: { hangul: '아빠', meaning: '爸爸' } },
      { char: 'ㅑ', name: '야', roman: 'ya', tip: 'ㅏ 再加一点，前面带 y。', example: { hangul: '야구', meaning: '棒球' } },
      { char: 'ㅓ', name: '어', roman: 'eo', tip: '竖线左边一点，接近「俄」。', example: { hangul: '어디', meaning: '哪里' } },
      { char: 'ㅕ', name: '여', roman: 'yeo', tip: 'ㅓ 加一点。', example: { hangul: '여자', meaning: '女人' } },
      { char: 'ㅗ', name: '오', roman: 'o', tip: '横线上边一点，写在辅音下方。', example: { hangul: '모자', meaning: '帽子' } },
    ],
    quiz: [
      { prompt: 'ㅏ', promptKind: 'char', answer: 'a', options: ['a', 'eo', 'o', 'u'] },
      { prompt: '어', promptKind: 'name', answer: 'ㅓ', options: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ'] },
      { prompt: 'ㅑ', promptKind: 'char', answer: 'ya', options: ['ya', 'yeo', 'yo', 'yu'] },
      { prompt: 'ㅗ', promptKind: 'char', answer: 'o', options: ['a', 'o', 'u', 'eu'] },
    ],
  },
  {
    id: 'vowels-2',
    order: 5,
    title: '基本元音（二）',
    subtitle: 'ㅛ ㅜ ㅠ ㅡ ㅣ',
    body: '10 个基本元音到这里齐了。ㅡ 是扁嘴的 eu，ㅣ 是「衣」。记住：点在上是 o 类，点在下是 u 类。',
    letters: [
      { char: 'ㅛ', name: '요', roman: 'yo', tip: 'ㅗ 再加一点。', example: { hangul: '요리', meaning: '料理' } },
      { char: 'ㅜ', name: '우', roman: 'u', tip: '横线下边一点，嘴唇撮圆。', example: { hangul: '우유', meaning: '牛奶' } },
      { char: 'ㅠ', name: '유', roman: 'yu', tip: 'ㅜ 再加一点。', example: { hangul: '유리', meaning: '玻璃' } },
      { char: 'ㅡ', name: '으', roman: 'eu', tip: '一条横线，嘴扁、舌后。', example: { hangul: '음식', meaning: '食物' } },
      { char: 'ㅣ', name: '이', roman: 'i', tip: '一条竖线，像「衣」。', example: { hangul: '이름', meaning: '名字' } },
    ],
    quiz: [
      { prompt: 'ㅣ', promptKind: 'char', answer: 'i', options: ['eu', 'i', 'u', 'a'] },
      { prompt: '으', promptKind: 'name', answer: 'ㅡ', options: ['ㅜ', 'ㅡ', 'ㅣ', 'ㅗ'] },
      { prompt: 'ㅠ', promptKind: 'char', answer: 'yu', options: ['yo', 'yu', 'ya', 'yeo'] },
      { prompt: 'ㅜ', promptKind: 'char', answer: 'u', options: ['o', 'u', 'eu', 'a'] },
    ],
  },
  {
    id: 'combine',
    order: 6,
    title: '拼成音节',
    subtitle: 'ㄱ + ㅏ = 가',
    body: '韩语用音节块书写，不是字母横排。竖元音（ㅏㅓㅣ）写在辅音右边：ㄱ+ㅏ=가。横元音（ㅗㅜㅡ）写在辅音下边：ㄱ+ㅗ=고。词首的 ㅇ 只占位：ㅇ+ㅏ=아。',
    letters: [
      { char: '가', name: '가', roman: 'ga', tip: 'ㄱ 在左，ㅏ 在右。', example: { hangul: '가게', meaning: '小店' } },
      { char: '나', name: '나', roman: 'na', tip: 'ㄴ + ㅏ。', example: { hangul: '나무', meaning: '树' } },
      { char: '고', name: '고', roman: 'go', tip: 'ㄱ 在上，ㅗ 在下。', example: { hangul: '고기', meaning: '肉' } },
      { char: '아', name: '아', roman: 'a', tip: 'ㅇ 不发音，只带出 ㅏ。', example: { hangul: '아이', meaning: '孩子' } },
      { char: '이', name: '이', roman: 'i', tip: 'ㅇ + ㅣ。', example: { hangul: '이름', meaning: '名字' } },
      { char: '수', name: '수', roman: 'su', tip: 'ㅅ 在上，ㅜ 在下。', example: { hangul: '수박', meaning: '西瓜' } },
    ],
    quiz: [
      { prompt: 'ㄱ + ㅏ', promptKind: 'sound', answer: '가', options: ['가', '고', '기', '구'] },
      { prompt: 'ㄴ + ㅗ', promptKind: 'sound', answer: '노', options: ['나', '너', '노', '누'] },
      { prompt: 'ㅇ + ㅣ', promptKind: 'sound', answer: '이', options: ['아', '어', '오', '이'] },
      { prompt: 'ㅁ + ㅜ', promptKind: 'sound', answer: '무', options: ['모', '무', '마', '미'] },
    ],
  },
  {
    id: 'batchim',
    order: 7,
    title: '韵尾 받침',
    subtitle: 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ',
    body: '音节下面还可以再塞一个辅音，叫韵尾。入门先记七个：ㄱ(k) ㄴ(n) ㄷ(t) ㄹ(l) ㅁ(m) ㅂ(p) ㅇ(ng)。例如 밥 的下面是 ㅂ。',
    letters: [
      { char: '각', name: '각', roman: 'gak', tip: '下面的 ㄱ 收成 k。', example: { hangul: '수박', meaning: '西瓜' } },
      { char: '간', name: '간', roman: 'gan', tip: '韵尾 ㄴ。', example: { hangul: '시간', meaning: '时间' } },
      { char: '갇', name: '갇', roman: 'gat', tip: '韵尾 ㄷ 听起来接近 t。', example: { hangul: '곧', meaning: '马上' } },
      { char: '갈', name: '갈', roman: 'gal', tip: '韵尾 ㄹ 接近 l。', example: { hangul: '말', meaning: '话 / 马' } },
      { char: '감', name: '감', roman: 'gam', tip: '韵尾 ㅁ。', example: { hangul: '밤', meaning: '夜晚 / 栗子' } },
      { char: '갑', name: '갑', roman: 'gap', tip: '韵尾 ㅂ 接近 p。', example: { hangul: '밥', meaning: '饭' } },
      { char: '강', name: '강', roman: 'gang', tip: '韵尾 ㅇ 是 ng。', example: { hangul: '강', meaning: '江' } },
    ],
    quiz: [
      { prompt: '밥 的韵尾', promptKind: 'sound', answer: 'ㅂ', options: ['ㄱ', 'ㄴ', 'ㅂ', 'ㅇ'] },
      { prompt: '강', promptKind: 'char', answer: 'gang', options: ['gan', 'gam', 'gang', 'gak'] },
      { prompt: '시간 的韵尾', promptKind: 'sound', answer: 'ㄴ', options: ['ㄴ', 'ㅁ', 'ㅇ', 'ㄹ'] },
      { prompt: '곧', promptKind: 'char', answer: 'got', options: ['gon', 'got', 'gol', 'gop'] },
    ],
  },
  {
    id: 'tensed',
    order: 8,
    title: '紧音',
    subtitle: 'ㄲ ㄸ ㅃ ㅆ ㅉ',
    body: '把基本辅音写两下，就变成紧音：喉咙收紧、声音更硬。ㄲ 接近 kk，不是汉语的「嘎」那么送气。',
    letters: [
      { char: 'ㄲ', name: '쌍기역', roman: 'kk', tip: '比 ㄱ 更紧、不送气。', example: { hangul: '꼬리', meaning: '尾巴' } },
      { char: 'ㄸ', name: '쌍디귿', roman: 'tt', tip: '比 ㄷ 更紧。', example: { hangul: '딸', meaning: '女儿' } },
      { char: 'ㅃ', name: '쌍비읍', roman: 'pp', tip: '比 ㅂ 更紧。', example: { hangul: '빵', meaning: '面包' } },
      { char: 'ㅆ', name: '쌍시옷', roman: 'ss', tip: '比 ㅅ 更紧。', example: { hangul: '쌀', meaning: '米' } },
      { char: 'ㅉ', name: '쌍지읒', roman: 'jj', tip: '比 ㅈ 更紧。', example: { hangul: '짜다', meaning: '咸' } },
    ],
    quiz: [
      { prompt: '빵 的声母', promptKind: 'sound', answer: 'ㅃ', options: ['ㅂ', 'ㅃ', 'ㅍ', 'ㅁ'] },
      { prompt: 'ㄲ', promptKind: 'char', answer: 'kk', options: ['g/k', 'k', 'kk', 'h'] },
      { prompt: '쌀', promptKind: 'char', answer: 'ssal', options: ['sal', 'ssal', 'chal', 'jal'] },
      { prompt: 'ㄸ', promptKind: 'char', answer: 'tt', options: ['d/t', 't', 'tt', 'ss'] },
    ],
  },
  {
    id: 'complex-vowels',
    order: 9,
    title: '复合元音',
    subtitle: 'ㅐ ㅔ ㅘ ㅝ ㅢ …',
    body: '两个元音可以合成一个。入门最常见：ㅐ ae、ㅔ e，听感接近；ㅘ wa、ㅝ wo、ㅢ ui。看到就读，先求认字。',
    letters: [
      { char: 'ㅐ', name: '애', roman: 'ae', tip: 'ㅏ + ㅣ，接近「爱」的前半。', example: { hangul: '개', meaning: '狗' } },
      { char: 'ㅔ', name: '에', roman: 'e', tip: 'ㅓ + ㅣ，接近 e。', example: { hangul: '네', meaning: '是' } },
      { char: 'ㅘ', name: '와', roman: 'wa', tip: 'ㅗ + ㅏ。', example: { hangul: '과자', meaning: '零食' } },
      { char: 'ㅝ', name: '워', roman: 'wo', tip: 'ㅜ + ㅓ。', example: { hangul: '뭐', meaning: '什么' } },
      { char: 'ㅚ', name: '외', roman: 'oe', tip: 'ㅗ + ㅣ，接近 we。', example: { hangul: '외국', meaning: '外国' } },
      { char: 'ㅟ', name: '위', roman: 'wi', tip: 'ㅜ + ㅣ。', example: { hangul: '귀', meaning: '耳朵' } },
      { char: 'ㅢ', name: '의', roman: 'ui', tip: 'ㅡ + ㅣ，所有格常读 e。', example: { hangul: '의사', meaning: '医生' } },
    ],
    quiz: [
      { prompt: 'ㅐ', promptKind: 'char', answer: 'ae', options: ['ae', 'e', 'a', 'i'] },
      { prompt: '뭐', promptKind: 'char', answer: 'mwo', options: ['meo', 'mwo', 'mo', 'mu'] },
      { prompt: '의', promptKind: 'char', answer: 'ui', options: ['eu', 'i', 'ui', 'wi'] },
      { prompt: '외', promptKind: 'name', answer: 'ㅚ', options: ['ㅘ', 'ㅚ', 'ㅟ', 'ㅢ'] },
    ],
  },
  {
    id: 'review',
    order: 10,
    title: '综合小测',
    subtitle: '准备进入单词',
    body: '把字母、拼合和韵尾串起来。过了这关，就可以开始用眼睛记单词了。随时还能回来复习。',
    letters: [
      { char: '한', name: '한', roman: 'han', tip: 'ㅎ + ㅏ + ㄴ。', example: { hangul: '한국', meaning: '韩国' } },
      { char: '글', name: '글', roman: 'geul', tip: 'ㄱ + ㅡ + ㄹ。', example: { hangul: '한글', meaning: '韩文' } },
      { char: '안', name: '안', roman: 'an', tip: 'ㅇ + ㅏ + ㄴ。', example: { hangul: '안녕', meaning: '你好' } },
      { char: '녕', name: '녕', roman: 'nyeong', tip: 'ㄴ + ㅕ + ㅇ。', example: { hangul: '안녕', meaning: '你好' } },
    ],
    quiz: [
      { prompt: '한글', promptKind: 'char', answer: 'hangeul', options: ['hangul', 'hangeul', 'hankul', 'angeul'] },
      { prompt: 'ㄱ + ㅡ + ㄹ', promptKind: 'sound', answer: '글', options: ['갈', '골', '글', '길'] },
      { prompt: '밥', promptKind: 'char', answer: 'bap', options: ['bab', 'bap', 'bam', 'bal'] },
      { prompt: '한국 的声母', promptKind: 'sound', answer: 'ㅎ', options: ['ㄱ', 'ㅋ', 'ㅎ', 'ㅇ'] },
      { prompt: 'ㅇ 作韵尾', promptKind: 'sound', answer: 'ng', options: ['不发音', 'n', 'ng', 'g'] },
    ],
  },
]
