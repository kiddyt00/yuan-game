var KG_DATA = {
  praise: ['你真棒！', '太厉害了！', '真聪明！', '哇，答对了！', '好样的！', '真了不起！'],
  retry: ['没关系，再想一想！', '别着急，再试一次！', '慢慢来，你可以的！', '再看看，加油！'],

  poems: [
    { title: '咏鹅', author: '唐·骆宾王', emoji: '🦢', lines: ['鹅，鹅，鹅，', '曲项向天歌。', '白毛浮绿水，', '红掌拨清波。'] },
    { title: '静夜思', author: '唐·李白', emoji: '🌙', lines: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'] },
    { title: '春晓', author: '唐·孟浩然', emoji: '🐦', lines: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'] },
    { title: '悯农', author: '唐·李绅', emoji: '🌾', lines: ['锄禾日当午，', '汗滴禾下土。', '谁知盘中餐，', '粒粒皆辛苦。'] },
    { title: '登鹳雀楼', author: '唐·王之涣', emoji: '🏞️', lines: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'] },
    { title: '画', author: '唐·王维', emoji: '🖼️', lines: ['远看山有色，', '近听水无声。', '春去花还在，', '人来鸟不惊。'] },
    { title: '池上', author: '唐·白居易', emoji: '🪷', lines: ['小娃撑小艇，', '偷采白莲回。', '不解藏踪迹，', '浮萍一道开。'] },
    { title: '江雪', author: '唐·柳宗元', emoji: '❄️', lines: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'] },
    { title: '寻隐者不遇', author: '唐·贾岛', emoji: '⛰️', lines: ['松下问童子，', '言师采药去。', '只在此山中，', '云深不知处。'] },
    { title: '小池', author: '宋·杨万里', emoji: '🐝', lines: ['泉眼无声惜细流，', '树阴照水爱晴柔。', '小荷才露尖尖角，', '早有蜻蜓立上头。'] }
  ],

  englishCategories: [
    { id: 'animals', name: '动物', emoji: '🐾', btn: 'btn-teal', words: [
      { en: 'cat', zh: '小猫', emoji: '🐱' }, { en: 'dog', zh: '小狗', emoji: '🐶' }, { en: 'panda', zh: '熊猫', emoji: '🐼' },
      { en: 'rabbit', zh: '兔子', emoji: '🐰' }, { en: 'tiger', zh: '老虎', emoji: '🐯' }, { en: 'lion', zh: '狮子', emoji: '🦁' },
      { en: 'monkey', zh: '猴子', emoji: '🐵' }, { en: 'elephant', zh: '大象', emoji: '🐘' }, { en: 'fish', zh: '鱼', emoji: '🐟' },
      { en: 'duck', zh: '鸭子', emoji: '🦆' }, { en: 'pig', zh: '小猪', emoji: '🐷' }, { en: 'cow', zh: '奶牛', emoji: '🐮' },
      { en: 'sheep', zh: '绵羊', emoji: '🐑' }, { en: 'frog', zh: '青蛙', emoji: '🐸' }, { en: 'bird', zh: '小鸟', emoji: '🐦' },
      { en: 'bear', zh: '熊', emoji: '🐻' }
    ] },
    { id: 'fruits', name: '水果', emoji: '🍎', btn: 'btn-orange', words: [
      { en: 'apple', zh: '苹果', emoji: '🍎' }, { en: 'banana', zh: '香蕉', emoji: '🍌' }, { en: 'orange', zh: '橙子', emoji: '🍊' },
      { en: 'grape', zh: '葡萄', emoji: '🍇' }, { en: 'watermelon', zh: '西瓜', emoji: '🍉' }, { en: 'strawberry', zh: '草莓', emoji: '🍓' },
      { en: 'peach', zh: '桃子', emoji: '🍑' }, { en: 'pear', zh: '梨', emoji: '🍐' }, { en: 'cherry', zh: '樱桃', emoji: '🍒' },
      { en: 'pineapple', zh: '菠萝', emoji: '🍍' }
    ] },
    { id: 'colors', name: '颜色', emoji: '🎨', btn: 'btn-pink', words: [
      { en: 'red', zh: '红色', emoji: '🔴' }, { en: 'yellow', zh: '黄色', emoji: '🟡' }, { en: 'blue', zh: '蓝色', emoji: '🔵' },
      { en: 'green', zh: '绿色', emoji: '🟢' }, { en: 'orange', zh: '橙色', emoji: '🟠' }, { en: 'purple', zh: '紫色', emoji: '🟣' },
      { en: 'black', zh: '黑色', emoji: '⚫' }, { en: 'white', zh: '白色', emoji: '⚪' }
    ] },
    { id: 'numbers', name: '数字', emoji: '🔢', btn: 'btn-blue', words: [
      { en: 'one', zh: '一', emoji: '1️⃣' }, { en: 'two', zh: '二', emoji: '2️⃣' }, { en: 'three', zh: '三', emoji: '3️⃣' },
      { en: 'four', zh: '四', emoji: '4️⃣' }, { en: 'five', zh: '五', emoji: '5️⃣' }, { en: 'six', zh: '六', emoji: '6️⃣' },
      { en: 'seven', zh: '七', emoji: '7️⃣' }, { en: 'eight', zh: '八', emoji: '8️⃣' }, { en: 'nine', zh: '九', emoji: '9️⃣' },
      { en: 'ten', zh: '十', emoji: '🔟' }
    ] },
    { id: 'family', name: '家庭', emoji: '👨‍👩‍👧', btn: 'btn-purple', words: [
      { en: 'daddy', zh: '爸爸', emoji: '👨' }, { en: 'mommy', zh: '妈妈', emoji: '👩' }, { en: 'grandpa', zh: '爷爷', emoji: '👴' },
      { en: 'grandma', zh: '奶奶', emoji: '👵' }, { en: 'brother', zh: '哥哥', emoji: '👦' }, { en: 'sister', zh: '姐姐', emoji: '👧' },
      { en: 'baby', zh: '宝宝', emoji: '👶' }
    ] },
    { id: 'food', name: '食物', emoji: '🍰', btn: 'btn-green', words: [
      { en: 'egg', zh: '鸡蛋', emoji: '🥚' }, { en: 'milk', zh: '牛奶', emoji: '🥛' }, { en: 'rice', zh: '米饭', emoji: '🍚' },
      { en: 'bread', zh: '面包', emoji: '🍞' }, { en: 'cake', zh: '蛋糕', emoji: '🎂' }, { en: 'ice cream', zh: '冰淇淋', emoji: '🍦' },
      { en: 'candy', zh: '糖果', emoji: '🍬' }, { en: 'noodles', zh: '面条', emoji: '🍜' }
    ] }
  ],

  letters: [
    { L: 'A', word: 'apple', emoji: '🍎' }, { L: 'B', word: 'ball', emoji: '🏀' }, { L: 'C', word: 'cat', emoji: '🐱' },
    { L: 'D', word: 'dog', emoji: '🐶' }, { L: 'E', word: 'egg', emoji: '🥚' }, { L: 'F', word: 'fish', emoji: '🐟' },
    { L: 'G', word: 'grape', emoji: '🍇' }, { L: 'H', word: 'house', emoji: '🏠' }, { L: 'I', word: 'ice cream', emoji: '🍦' },
    { L: 'J', word: 'juice', emoji: '🧃' }, { L: 'K', word: 'key', emoji: '🔑' }, { L: 'L', word: 'lion', emoji: '🦁' },
    { L: 'M', word: 'moon', emoji: '🌙' }, { L: 'N', word: 'nose', emoji: '👃' }, { L: 'O', word: 'orange', emoji: '🍊' },
    { L: 'P', word: 'panda', emoji: '🐼' }, { L: 'Q', word: 'queen', emoji: '👑' }, { L: 'R', word: 'rabbit', emoji: '🐰' },
    { L: 'S', word: 'sun', emoji: '☀️' }, { L: 'T', word: 'tiger', emoji: '🐯' }, { L: 'U', word: 'umbrella', emoji: '☂️' },
    { L: 'V', word: 'violin', emoji: '🎻' }, { L: 'W', word: 'watermelon', emoji: '🍉' }, { L: 'X', word: 'xylophone', emoji: '🎹' },
    { L: 'Y', word: 'yarn', emoji: '🧶' }, { L: 'Z', word: 'zebra', emoji: '🦓' }
  ],

  patternColors: [
    { cls: 'p-red', name: '红色' }, { cls: 'p-yellow', name: '黄色' },
    { cls: 'p-blue', name: '蓝色' }, { cls: 'p-green', name: '绿色' }
  ],
  patternEmojis: [
    { emoji: '🍎', name: '苹果' }, { emoji: '🍌', name: '香蕉' }, { emoji: '⭐', name: '星星' },
    { emoji: '🎈', name: '气球' }, { emoji: '🐟', name: '小鱼' }, { emoji: '🌸', name: '花朵' }
  ],

  countPool: ['🍎', '🐟', '🌸', '🍓', '🐤', '⭐', '🦆', '🍭'],

  animalSpecies: [
    { emoji: '🐰', name: '小兔子' }, { emoji: '🐑', name: '小羊' }, { emoji: '🦆', name: '小鸭子' }, { emoji: '🐷', name: '小猪' },
    { emoji: '🐮', name: '小牛' }, { emoji: '🐸', name: '小青蛙' }, { emoji: '🐔', name: '小鸡' }, { emoji: '🦋', name: '蝴蝶' },
    { emoji: '🐞', name: '瓢虫' }, { emoji: '🐢', name: '乌龟' }
  ],

  matchPool: ['🐰', '🐶', '🐱', '🐼', '🦁', '🐸', '🐵', '🐨', '🦊', '🐷', '🐮', '🐔', '🦆', '🐧', '🦉', '🐝', '🦋', '🐢']
};
