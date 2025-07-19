// Цвета карт - можно настроить по своему усмотрению
const cardColors = [
  '#2d5016', // темно-зеленый
  '#1a365d', // темно-синий  
  '#742a2a', // темно-красный
];

// Функция для получения цвета карты по её порядковому номеру
function getCardColor(order) {
  return cardColors[order % cardColors.length];
}

// Явный массив из 250 карточек для ручного заполнения
const cards = [
   {
    id: 1,
    title: 'Событие 1',
  imageFront: '',
  imageBack: '',
    difficulty: 1,
    verse: 'Описание события 1',
    order: 1,
    color: getCardColor(1)
  },
  {
    id: 2,
    title: 'Событие 2',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 2',
    order: 2,
    color: getCardColor(2)
  },
  {
    id: 3,
    title: 'Событие 3',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 3',
    order: 3,
    color: getCardColor(3)
  },
  {
    id: 4,
    title: 'Событие 4',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 4',
    order: 4,
    color: getCardColor(4)
  },
  {
    id: 5,
    title: 'Событие 5',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 5',
    order: 5,
    color: getCardColor(5)
  },
  {
    id: 6,
    title: 'Событие 6',
    imageFront: "/cards/6.png",
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 6',
    order: 6,
    color: getCardColor(6)
  },
  {
    id: 7,
    title: 'Событие 7',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 7',
    order: 7,
    color: getCardColor(7)
  },
  {
    id: 8,
    title: 'Событие 8',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 8',
    order: 8,
    color: getCardColor(8)
  },
  {
    id: 9,
    title: 'Событие 9',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 9',
    order: 9,
    color: getCardColor(9)
  },
  {
    id: 10,
    title: 'Первое убийство',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: '(Бытие 4:8)',
    order: 10,
    color: getCardColor(10)
  },
  {
    id: 11,
    title: 'Событие 11',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 11',
    order: 11,
    color: getCardColor(11)
  },
  {
    id: 12,
    title: 'Событие 12',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 12',
    order: 12,
    color: getCardColor(12)
  },
  {
    id: 13,
    title: 'Событие 13',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 13',
    order: 13,
    color: getCardColor(13)
  },
  {
    id: 14,
    title: 'Событие 14',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 14',
    order: 14,
    color: getCardColor(14)
  },
  {
    id: 15,
    title: 'Событие 15',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 15',
    order: 15,
    color: getCardColor(15)
  },
  {
    id: 16,
    title: 'Событие 16',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 16',
    order: 16,
    color: getCardColor(16)
  },
  {
    id: 17,
    title: 'Событие 17',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 17',
    order: 17,
    color: getCardColor(17)
  },
  {
    id: 18,
    title: 'Событие 18',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 18',
    order: 18,
    color: getCardColor(18)
  },
  {
    id: 19,
    title: 'Событие 19',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 19',
    order: 19,
    color: getCardColor(19)
  },
  {
    id: 20,
    title: 'Событие 20',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 20',
    order: 20,
    color: getCardColor(20)
  },
  {
    id: 21,
    title: 'Событие 21',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 21',
    order: 21,
    color: getCardColor(21)
  },
  {
    id: 22,
    title: 'Событие 22',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 22',
    order: 22,
    color: getCardColor(22)
  },
  {
    id: 23,
    title: 'Событие 23',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 23',
    order: 23,
    color: getCardColor(23)
  },
  {
    id: 24,
    title: 'Событие 24',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 24',
    order: 24,
    color: getCardColor(24)
  },
  {
    id: 25,
    title: 'Событие 25',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 25',
    order: 25,
    color: getCardColor(25)
  },
  {
    id: 26,
    title: 'Событие 26',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 26',
    order: 26,
    color: getCardColor(26)
  },
  {
    id: 27,
    title: 'Событие 27',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 27',
    order: 27,
    color: getCardColor(27)
  },
  {
    id: 28,
    title: 'Событие 28',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 28',
    order: 28,
    color: getCardColor(28)
  },
  {
    id: 29,
    title: 'Событие 29',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 29',
    order: 29,
    color: getCardColor(29)
  },
  {
    id: 30,
    title: 'Событие 30',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 30',
    order: 30,
    color: getCardColor(30)
  },
  {
    id: 31,
    title: 'Событие 31',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 31',
    order: 31,
    color: getCardColor(31)
  },
  {
    id: 32,
    title: 'Событие 32',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 32',
    order: 32,
    color: getCardColor(32)
  },
  {
    id: 33,
    title: 'Событие 33',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 33',
    order: 33,
    color: getCardColor(33)
  },
  {
    id: 34,
    title: 'Событие 34',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 34',
    order: 34,
    color: getCardColor(34)
  },
  {
    id: 35,
    title: 'Событие 35',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 35',
    order: 35,
    color: getCardColor(35)
  },
  {
    id: 36,
    title: 'Событие 36',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 36',
    order: 36,
    color: getCardColor(36)
  },
  {
    id: 37,
    title: 'Событие 37',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 37',
    order: 37,
    color: getCardColor(37)
  },
  {
    id: 38,
    title: 'Событие 38',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 38',
    order: 38,
    color: getCardColor(38)
  },
  {
    id: 39,
    title: 'Событие 39',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 39',
    order: 39,
    color: getCardColor(39)
  },
  {
    id: 40,
    title: 'Событие 40',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 40',
    order: 40,
    color: getCardColor(40)
  },
  {
    id: 41,
    title: 'Событие 41',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 41',
    order: 41,
    color: getCardColor(41)
  },
  {
    id: 42,
    title: 'Событие 42',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 42',
    order: 42,
    color: getCardColor(42)
  },
  {
    id: 43,
    title: 'Событие 43',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 43',
    order: 43,
    color: getCardColor(43)
  },
  {
    id: 44,
    title: 'Событие 44',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 44',
    order: 44,
    color: getCardColor(44)
  },
  {
    id: 45,
    title: 'Событие 45',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 45',
    order: 45,
    color: getCardColor(45)
  },
  {
    id: 46,
    title: 'Событие 46',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 46',
    order: 46,
    color: getCardColor(46)
  },
  {
    id: 47,
    title: 'Событие 47',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 47',
    order: 47,
    color: getCardColor(47)
  },
  {
    id: 48,
    title: 'Событие 48',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 48',
    order: 48,
    color: getCardColor(48)
  },
  {
    id: 49,
    title: 'Событие 49',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 49',
    order: 49,
    color: getCardColor(49)
  },
  {
    id: 50,
    title: 'Событие 50',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 50',
    order: 50,
    color: getCardColor(50)
  },
  {
    id: 51,
    title: 'Событие 51',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 51',
    order: 51,
    color: getCardColor(51)
  },
  {
    id: 52,
    title: 'Событие 52',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 52',
    order: 52,
    color: getCardColor(52)
  },
  {
    id: 53,
    title: 'Событие 53',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 53',
    order: 53,
    color: getCardColor(53)
  },
  {
    id: 54,
    title: 'Событие 54',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 54',
    order: 54,
    color: getCardColor(54)
  },
  {
    id: 55,
    title: 'Событие 55',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 55',
    order: 55,
    color: getCardColor(55)
  },
  {
    id: 56,
    title: 'Событие 56',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 56',
    order: 56,
    color: getCardColor(56)
  },
  {
    id: 57,
    title: 'Событие 57',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 57',
    order: 57,
    color: getCardColor(57)
  },
  {
    id: 58,
    title: 'Событие 58',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 58',
    order: 58,
    color: getCardColor(58)
  },
  {
    id: 59,
    title: 'Событие 59',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 59',
    order: 59,
    color: getCardColor(59)
  },
  {
    id: 60,
    title: 'Событие 60',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 60',
    order: 60,
    color: getCardColor(60)
  },
  {
    id: 61,
    title: 'Событие 61',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 61',
    order: 61,
    color: getCardColor(61)
  },
  {
    id: 62,
    title: 'Событие 62',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 62',
    order: 62,
    color: getCardColor(62)
  },
  {
    id: 63,
    title: 'Событие 63',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 63',
    order: 63,
    color: getCardColor(63)
  },
  {
    id: 64,
    title: 'Событие 64',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 64',
    order: 64,
    color: getCardColor(64)
  },
  {
    id: 65,
    title: 'Событие 65',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 65',
    order: 65,
    color: getCardColor(65)
  },
  {
    id: 66,
    title: 'Событие 66',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 66',
    order: 66,
    color: getCardColor(66)
  },
  {
    id: 67,
    title: 'Событие 67',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 67',
    order: 67,
    color: getCardColor(67)
  },
  {
    id: 68,
    title: 'Событие 68',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 68',
    order: 68,
    color: getCardColor(68)
  },
  {
    id: 69,
    title: 'Событие 69',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 69',
    order: 69,
    color: getCardColor(69)
  },
  {
    id: 70,
    title: 'Событие 70',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 70',
    order: 70,
    color: getCardColor(70)
  },
  {
    id: 71,
    title: 'Событие 71',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 71',
    order: 71,
    color: getCardColor(71)
  },
  {
    id: 72,
    title: 'Событие 72',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 72',
    order: 72,
    color: getCardColor(72)
  },
  {
    id: 73,
    title: 'Событие 73',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 73',
    order: 73,
    color: getCardColor(73)
  },
  {
    id: 74,
    title: 'Событие 74',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 74',
    order: 74,
    color: getCardColor(74)
  },
  {
    id: 75,
    title: 'Событие 75',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 75',
    order: 75,
    color: getCardColor(75)
  },
  {
    id: 76,
    title: 'Событие 76',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 76',
    order: 76,
    color: getCardColor(76)
  },
  {
    id: 77,
    title: 'Событие 77',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 77',
    order: 77,
    color: getCardColor(77)
  },
  {
    id: 78,
    title: 'Событие 78',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 78',
    order: 78,
    color: getCardColor(78)
  },
  {
    id: 79,
    title: 'Событие 79',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 79',
    order: 79,
    color: getCardColor(79)
  },
  {
    id: 80,
    title: 'Событие 80',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 80',
    order: 80,
    color: getCardColor(80)
  },
  {
    id: 81,
    title: 'Событие 81',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 81',
    order: 81,
    color: getCardColor(81)
  },
  {
    id: 82,
    title: 'Событие 82',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 82',
    order: 82,
    color: getCardColor(82)
  },
  {
    id: 83,
    title: 'Событие 83',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 83',
    order: 83,
    color: getCardColor(83)
  },
  {
    id: 84,
    title: 'Событие 84',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 84',
    order: 84,
    color: getCardColor(84)
  },
  {
    id: 85,
    title: 'Событие 85',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 85',
    order: 85,
    color: getCardColor(85)
  },
  {
    id: 86,
    title: 'Событие 86',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 86',
    order: 86,
    color: getCardColor(86)
  },
  {
    id: 87,
    title: 'Событие 87',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 87',
    order: 87,
    color: getCardColor(87)
  },
  {
    id: 88,
    title: 'Событие 88',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 88',
    order: 88,
    color: getCardColor(88)
  },
  {
    id: 89,
    title: 'Событие 89',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 89',
    order: 89,
    color: getCardColor(89)
  },
  {
    id: 90,
    title: 'Событие 90',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 90',
    order: 90,
    color: getCardColor(90)
  },
  {
    id: 91,
    title: 'Событие 91',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 91',
    order: 91,
    color: getCardColor(91)
  },
  {
    id: 92,
    title: 'Событие 92',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 92',
    order: 92,
    color: getCardColor(92)
  },
  {
    id: 93,
    title: 'Событие 93',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 93',
    order: 93,
    color: getCardColor(93)
  },
  {
    id: 94,
    title: 'Событие 94',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 94',
    order: 94,
    color: getCardColor(94)
  },
  {
    id: 95,
    title: 'Событие 95',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 95',
    order: 95,
    color: getCardColor(95)
  },
  {
    id: 96,
    title: 'Событие 96',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 96',
    order: 96,
    color: getCardColor(96)
  },
  {
    id: 97,
    title: 'Событие 97',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 97',
    order: 97,
    color: getCardColor(97)
  },
  {
    id: 98,
    title: 'Событие 98',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 98',
    order: 98,
    color: getCardColor(98)
  },
  {
    id: 99,
    title: 'Событие 99',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 99',
    order: 99,
    color: getCardColor(99)
  },
  {
    id: 100,
    title: 'Событие 100',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 100',
    order: 100,
    color: getCardColor(100)
  },
  {
    id: 101,
    title: 'Событие 101',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 101',
    order: 101,
    color: getCardColor(101)
  },
  {
    id: 102,
    title: 'Событие 102',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 102',
    order: 102,
    color: getCardColor(102)
  },
  {
    id: 103,
    title: 'Событие 103',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 103',
    order: 103,
    color: getCardColor(103)
  },
  {
    id: 104,
    title: 'Событие 104',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 104',
    order: 104,
    color: getCardColor(104)
  },
  {
    id: 105,
    title: 'Событие 105',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 105',
    order: 105,
    color: getCardColor(105)
  },
  {
    id: 106,
    title: 'Событие 106',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 106',
    order: 106,
    color: getCardColor(106)
  },
  {
    id: 107,
    title: 'Событие 107',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 107',
    order: 107,
    color: getCardColor(107)
  },
  {
    id: 108,
    title: 'Событие 108',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 108',
    order: 108,
    color: getCardColor(108)
  },
  {
    id: 109,
    title: 'Событие 109',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 109',
    order: 109,
    color: getCardColor(109)
  },
  {
    id: 110,
    title: 'Событие 110',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 110',
    order: 110,
    color: getCardColor(110)
  },
  {
    id: 111,
    title: 'Событие 111',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 111',
    order: 111,
    color: getCardColor(111)
  },
  {
    id: 112,
    title: 'Событие 112',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 112',
    order: 112,
    color: getCardColor(112)
  },
  {
    id: 113,
    title: 'Событие 113',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 113',
    order: 113,
    color: getCardColor(113)
  },
  {
    id: 114,
    title: 'Событие 114',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 114',
    order: 114,
    color: getCardColor(114)
  },
  {
    id: 115,
    title: 'Событие 115',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 115',
    order: 115,
    color: getCardColor(115)
  },
  {
    id: 116,
    title: 'Событие 116',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 116',
    order: 116,
    color: getCardColor(116)
  },
  {
    id: 117,
    title: 'Событие 117',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 117',
    order: 117,
    color: getCardColor(117)
  },
  {
    id: 118,
    title: 'Событие 118',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 118',
    order: 118,
    color: getCardColor(118)
  },
  {
    id: 119,
    title: 'Событие 119',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 119',
    order: 119,
    color: getCardColor(119)
  },
  {
    id: 120,
    title: 'Событие 120',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 120',
    order: 120,
    color: getCardColor(120)
  },
  {
    id: 121,
    title: 'Событие 121',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 121',
    order: 121,
    color: getCardColor(121)
  },
  {
    id: 122,
    title: 'Событие 122',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 122',
    order: 122,
    color: getCardColor(122)
  },
  {
    id: 123,
    title: 'Событие 123',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 123',
    order: 123,
    color: getCardColor(123)
  },
  {
    id: 124,
    title: 'Событие 124',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 124',
    order: 124,
    color: getCardColor(124)
  },
  {
    id: 125,
    title: 'Событие 125',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 125',
    order: 125,
    color: getCardColor(125)
  },
  {
    id: 126,
    title: 'Событие 126',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 126',
    order: 126,
    color: getCardColor(126)
  },
  {
    id: 127,
    title: 'Событие 127',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 127',
    order: 127,
    color: getCardColor(127)
  },
  {
    id: 128,
    title: 'Событие 128',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 128',
    order: 128,
    color: getCardColor(128)
  },
  {
    id: 129,
    title: 'Событие 129',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 129',
    order: 129,
    color: getCardColor(129)
  },
  {
    id: 130,
    title: 'Событие 130',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 130',
    order: 130,
    color: getCardColor(130)
  },
  {
    id: 131,
    title: 'Событие 131',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 131',
    order: 131,
    color: getCardColor(131)
  },
  {
    id: 132,
    title: 'Событие 132',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 132',
    order: 132,
    color: getCardColor(132)
  },
  {
    id: 133,
    title: 'Событие 133',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 133',
    order: 133,
    color: getCardColor(133)
  },
  {
    id: 134,
    title: 'Событие 134',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 134',
    order: 134,
    color: getCardColor(134)
  },
  {
    id: 135,
    title: 'Событие 135',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 135',
    order: 135,
    color: getCardColor(135)
  },
  {
    id: 136,
    title: 'Событие 136',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 136',
    order: 136,
    color: getCardColor(136)
  },
  {
    id: 137,
    title: 'Событие 137',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 137',
    order: 137,
    color: getCardColor(137)
  },
  {
    id: 138,
    title: 'Событие 138',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 138',
    order: 138,
    color: getCardColor(138)
  },
  {
    id: 139,
    title: 'Событие 139',
    imageFront: "/cards/139.png",
    imageBack: "/cards/139.png",
    difficulty: 1,
    verse: 'Описание события 139',
    order: 139,
    color: getCardColor(139)
  },
  {
    id: 140,
    title: 'Событие 140',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 140',
    order: 140,
    color: getCardColor(140)
  },
  {
    id: 141,
    title: 'Событие 141',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 141',
    order: 141,
    color: getCardColor(141)
  },
  {
    id: 142,
    title: 'Событие 142',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 142',
    order: 142,
    color: getCardColor(142)
  },
  {
    id: 143,
    title: 'Рождение Иисуса',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 143',
    order: 143,
    color: getCardColor(143)
  },
  {
    id: 144,
    title: 'Событие 144',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 144',
    order: 144,
    color: getCardColor(144)
  },
  {
    id: 145,
    title: 'Событие 145',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 145',
    order: 145,
    color: getCardColor(145)
  },
  {
    id: 146,
    title: 'Событие 146',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 146',
    order: 146,
    color: getCardColor(146)
  },
  {
    id: 147,
    title: 'Событие 147',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 147',
    order: 147,
    color: getCardColor(147)
  },
  {
    id: 148,
    title: 'Событие 148',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 148',
    order: 148,
    color: getCardColor(148)
  },
  {
    id: 149,
    title: 'Событие 149',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 149',
    order: 149,
    color: getCardColor(149)
  },
  {
    id: 150,
    title: 'Событие 150',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 150',
    order: 150,
    color: getCardColor(150)
  },
  {
    id: 151,
    title: 'Событие 151',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 151',
    order: 151,
    color: getCardColor(151)
  },
  {
    id: 152,
    title: 'Событие 152',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 152',
    order: 152,
    color: getCardColor(152)
  },
  {
    id: 153,
    title: 'Событие 153',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 153',
    order: 153,
    color: getCardColor(153)
  },
  {
    id: 154,
    title: 'Событие 154',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 154',
    order: 154,
    color: getCardColor(154)
  },
  {
    id: 155,
    title: 'Событие 155',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 155',
    order: 155,
    color: getCardColor(155)
  },
  {
    id: 156,
    title: 'Событие 156',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 156',
    order: 156,
    color: getCardColor(156)
  },
  {
    id: 157,
    title: 'Событие 157',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 157',
    order: 157,
    color: getCardColor(157)
  },
  {
    id: 158,
    title: 'Событие 158',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 158',
    order: 158,
    color: getCardColor(158)
  },
  {
    id: 159,
    title: 'Событие 159',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 159',
    order: 159,
    color: getCardColor(159)
  },
  {
    id: 160,
    title: 'Событие 160',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 160',
    order: 160,
    color: getCardColor(160)
  },
  {
    id: 161,
    title: 'Событие 161',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 161',
    order: 161,
    color: getCardColor(161)
  },
  {
    id: 162,
    title: 'Событие 162',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 162',
    order: 162,
    color: getCardColor(162)
  },
  {
    id: 163,
    title: 'Событие 163',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 163',
    order: 163,
    color: getCardColor(163)
  },
  {
    id: 164,
    title: 'Событие 164',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 164',
    order: 164,
    color: getCardColor(164)
  },
  {
    id: 165,
    title: 'Событие 165',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 165',
    order: 165,
    color: getCardColor(165)
  },
  {
    id: 166,
    title: 'Событие 166',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 166',
    order: 166,
    color: getCardColor(166)
  },
  {
    id: 167,
    title: 'Событие 167',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 167',
    order: 167,
    color: getCardColor(167)
  },
  {
    id: 168,
    title: 'Иисус скрылся за облаком',
    imageFront: '/cards/168.png',
    imageBack: '/cards/168.png',
    difficulty: 3,
    verse: 'Описание события 168',
    order: 168,
    color: getCardColor(168)
  },
  {
    id: 169,
    title: 'Событие 169',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 169',
    order: 169,
    color: getCardColor(169)
  },
  {
    id: 170,
    title: 'Событие 170',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 170',
    order: 170,
    color: getCardColor(170)
  },
  {
    id: 171,
    title: 'Событие 171',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 171',
    order: 171,
    color: getCardColor(171)
  },
  {
    id: 172,
    title: 'Событие 172',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 172',
    order: 172,
    color: getCardColor(172)
  },
  {
    id: 173,
    title: 'Событие 173',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 173',
    order: 173,
    color: getCardColor(173)
  },
  {
    id: 174,
    title: 'Событие 174',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 174',
    order: 174,
    color: getCardColor(174)
  },
  {
    id: 175,
    title: 'Событие 175',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 175',
    order: 175,
    color: getCardColor(175)
  },
  {
    id: 176,
    title: 'Событие 176',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 176',
    order: 176,
    color: getCardColor(176)
  },
  {
    id: 177,
    title: 'Событие 177',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 177',
    order: 177,
    color: getCardColor(177)
  },
  {
    id: 178,
    title: 'Событие 178',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 178',
    order: 178,
    color: getCardColor(178)
  },
  {
    id: 179,
    title: 'Событие 179',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 179',
    order: 179,
    color: getCardColor(179)
  },
  {
    id: 180,
    title: 'Событие 180',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 180',
    order: 180,
    color: getCardColor(180)
  },
  {
    id: 181,
    title: 'Событие 181',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 181',
    order: 181,
    color: getCardColor(181)
  },
  {
    id: 182,
    title: 'Событие 182',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 182',
    order: 182,
    color: getCardColor(182)
  },
  {
    id: 183,
    title: 'Событие 183',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 183',
    order: 183,
    color: getCardColor(183)
  },
  {
    id: 184,
    title: 'Событие 184',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 184',
    order: 184,
    color: getCardColor(184)
  },
  {
    id: 185,
    title: 'Событие 185',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 185',
    order: 185,
    color: getCardColor(185)
  },
  {
    id: 186,
    title: 'Событие 186',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 186',
    order: 186,
    color: getCardColor(186)
  },
  {
    id: 187,
    title: 'Событие 187',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 187',
    order: 187,
    color: getCardColor(187)
  },
  {
    id: 188,
    title: 'Событие 188',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 188',
    order: 188,
    color: getCardColor(188)
  },
  {
    id: 189,
    title: 'Событие 189',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 189',
    order: 189,
    color: getCardColor(189)
  },
  {
    id: 190,
    title: 'Событие 190',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 190',
    order: 190,
    color: getCardColor(190)
  },
  {
    id: 191,
    title: 'Событие 191',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 191',
    order: 191,
    color: getCardColor(191)
  },
  {
    id: 192,
    title: 'Событие 192',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 192',
    order: 192,
    color: getCardColor(192)
  },
  {
    id: 193,
    title: 'Событие 193',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 193',
    order: 193,
    color: getCardColor(193)
  },
  {
    id: 194,
    title: 'Событие 194',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 194',
    order: 194,
    color: getCardColor(194)
  },
  {
    id: 195,
    title: 'Событие 195',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 195',
    order: 195,
    color: getCardColor(195)
  },
  {
    id: 196,
    title: 'Событие 196',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 196',
    order: 196,
    color: getCardColor(196)
  },
  {
    id: 197,
    title: 'Событие 197',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 197',
    order: 197,
    color: getCardColor(197)
  },
  {
    id: 198,
    title: 'Событие 198',
    imageFront: '',
    imageBack: '',
    difficulty: 3,
    verse: 'Описание события 198',
    order: 198,
    color: getCardColor(198)
  },
  {
    id: 199,
    title: 'Событие 199',
    imageFront: '',
    imageBack: '',
    difficulty: 1,
    verse: 'Описание события 199',
    order: 199,
    color: getCardColor(199)
  },
  {
    id: 200,
    title: 'Событие 200',
    imageFront: '',
    imageBack: '',
    difficulty: 2,
    verse: 'Описание события 200',
    order: 200,
    color: getCardColor(200)
  }
];

const fs = require('fs');
if (require.main === module) {
  fs.writeFileSync(
    __dirname + '/cards.json',
    JSON.stringify(cards, null, 2),
    'utf-8'
  );
  console.log('cards.json успешно создан');
}

module.exports = { cards, cardColors, getCardColor }; 