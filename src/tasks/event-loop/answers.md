Попытка решить задачу

1
12
6
4
5
2
3
7
11
10
8
9

После первого запуска все правильно, кроме 2, 3, почему то они в консоли идут в порядке 3, 2

Второго и третьего запуска все теперь нормально, как и у меня 

Похоже изза setTimeout иногда может менятся

Задачи на event loop не сложные, главное если код большой то записывать надо, например я paint использовал. Решил получается с первого раза)

Ниже написал полное решение по шагам (●'◡'●)


Начало выполнения

console.log("1: sync start"); сразу попадает в стек и выводит в консоль 
"1: sync start"

setTimeout(() => console.log("2: setTimeout 0"), 0); таймаут попадает в web api и раз у нас задержка 0 то его коллбек почти сразу переходит в очередь МАКРОзадач

setImmediate(() => console.log("3: setImmediate")); плохо знаю что делает setImmediate потому что еще не использовал такое, но прочитав в интерненте понял что setImmediate предназначен чтоб выполнить коллбек после основного кода, и он кладет свой коллбек в очередь МАКРОзадач

(на данный момент у нас находится уже две задачи в очереди МАКРОзадач)

Promise.resolve()
  .then(() => console.log("4: promise.then 1")) коллбек который передается в then или catch переносится в очередь МИКРОзадач
  .then(() => console.log("5: promise.then 2")); коллбек который передается в then или catch переносится в очередь МИКРОзадач

process.nextTick(() => console.log("6: nextTick")); коллбек который находится в process.nextTick выполняется после основного кода, и до МИКРОзадач


fs.readFile(__filename, () => {
  console.log("7: readFile callback");

  setTimeout(() => console.log("8: inner setTimeout 0"), 0);
  setImmediate(() => console.log("9: inner setImmediate"));

  Promise.resolve().then(() => console.log("10: inner promise"));
  process.nextTick(() => console.log("11: inner nextTick"));
}); чтение файла переносит ВЕСЬ вот этот большой коллбек в очередь МАКРОзадач

console.log("12: sync end"); попадает в стек, выполняется и в консоли выводит 
"12: sync end"

На данный момент у нас прошел основной код, в консоли два вывода:
"1: sync start"
"12: sync end"
, НО у нас еще 1 задача от process.nextTick, 2 задачи в очереди МИКРОзадач, и 3 задачи в очереди МАКРОзадач:

process.nextTick:
() => console.log("6: nextTick")

МИКРОзадачи
() => console.log("4: promise.then 1")
() => console.log("5: promise.then 2")

МАКРОзадачи
() => console.log("2: setTimeout 0")
() => console.log("3: setImmediate")
() => {
  console.log("7: readFile callback");

  setTimeout(() => console.log("8: inner setTimeout 0"), 0);
  setImmediate(() => console.log("9: inner setImmediate"));

  Promise.resolve().then(() => console.log("10: inner promise"));
  process.nextTick(() => console.log("11: inner nextTick"));
}

По правилу у нас сначала выполняются срочные задачи из process.nextTick
и в консоль выводится 
"6: nextTick"

Далее у нас будут выполнятся МИКРОзадачи потому что у них приоритет над МАКРОзадачами
в консоль выводится 
"4: promise.then 1"
"5: promise.then 2"

Когда все микрозадачи закончились то начинается выполнение ОДНОЙ МАКРОзадачи
первая в очереди стоит () => console.log("2: setTimeout 0")
по этому в консоли мы видим 
"2: setTimeout 0"

После этого node js проверяет есть ли у нас МИКРОзадачи, и раз их нету то он приступает к выполнению новой МАКРОзадачи
() => console.log("3: setImmediate") и в консоль выводится 
"3: setImmediate"

Далее опять проверка есть ли МИКРОзадачи, и раз их нету то он выполняет новую МАКРОзадачу
() => {
  console.log("7: readFile callback"); 

  setTimeout(() => console.log("8: inner setTimeout 0"), 0);
  setImmediate(() => console.log("9: inner setImmediate"));

  Promise.resolve().then(() => console.log("10: inner promise"));
  process.nextTick(() => console.log("11: inner nextTick"));
}

Пройдемся по каждой строчке этой функции!

console.log("7: readFile callback"); выполняется и в консоль выводится 
"7: readFile callback"

setTimeout(() => console.log("8: inner setTimeout 0"), 0); таймаут попадает в web api и так как стоит 0 мс то его коллбек почти сразу попадает в очередь МАКРОзадач

setImmediate(() => console.log("9: inner setImmediate")); его коллбек попадает в очередь МАКРОзадач

Promise.resolve().then(() => console.log("10: inner promise")); промис выполнится и коллбек который мы передали в then перейдет в очередь МИКРОзадач

process.nextTick(() => console.log("11: inner nextTick")); как я уже говорил, коллбек выполнится после завершения функции и до МИКРОзадач


На данный момент у нас в консоли
"1: sync start"
"12: sync end"
"6: nextTick"
"4: promise.then 1"
"5: promise.then 2"
"2: setTimeout 0"
"3: setImmediate"
"7: readFile callback"
, НО у нас еще есть одна задача process.nextTick, 1 задача в очереди МИКРОзадач, и 2 задачи в очереди МАКРОзадач

process.nextTick:
() => console.log("11: inner nextTick")

МИКРОзадачи
() => console.log("10: inner promise")

МАКРОзадачи
() => console.log("8: inner setTimeout 0")
() => console.log("9: inner setImmediate")

Выполняются задачи сначала срочные которые в process.nextTick
() => console.log("11: inner nextTick") и в консоль выводится 
"11: inner nextTick"

Далее МИКРОзадачи
() => console.log("10: inner promise") и в консоль выводится 
"10: inner promise"

Далее раз у нас очередь микрозадач пустая то он берет ОДНУ МАКРОзадачу
() => console.log("8: inner setTimeout 0") она выполняется и в консоль выводится 
"8: inner setTimeout 0"

Далее проверяет очередь МИКРОзадач, и раз она пустая, то берет новую задачу из МАКРОзадач
() => console.log("9: inner setImmediate") и выводит в консоль 
"9: inner setImmediate"


По итогу мы получаем в консоли вот такой вывод):
"1: sync start"
"12: sync end"
"6: nextTick"
"4: promise.then 1"
"5: promise.then 2"
"2: setTimeout 0"
"3: setImmediate"
"7: readFile callback"
"11: inner nextTick"
"10: inner promise"
"8: inner setTimeout 0"
"9: inner setImmediate"

Проверил еще несколько раз и все сходится, значит задача была решена правильно)

Задачу решал сам и решение тоже писал сам своими словами, и надеюсь все было понятно расписано (●'◡'●)


P.S. Заметил одну странность что у меня в самый первый раз почему-то 2 и 3 поменялись при выполнении кода, почему так получилось не понятно, ведь в остальные выполнения у меня выводилось все правильно.

В интернете на это, сказали что это случайность потому что код из setTimeout выполнился не сразу и то что хоть и стоит что 0ms задержка у него, он все равно может задерживаться на 1-4 ms. И он не успел выполнится и начал выполнятся setImmediate, по этому они и поменялись местами. Это правда?