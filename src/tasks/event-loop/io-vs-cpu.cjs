const fs = require("fs").promises;

function CPUBound() {
  let sum = 0;
  console.time("CPU Bound");

  setTimeout(() => console.log('I should fire in 100ms'), 100); 
  // setTimeout переходит в через 100ms в МАКРОзадачи, но стек занят выполнением операции ниже 
  // и раз цикл event loop быстро не заканчивается то выполнение МАКРОзадач не происходит пока цикл не закончится
  // и в итоге мы получаем ответ не сразу а только когда стек освободился
  for (let i = 1; i < 1000000000; i++) {
    sum += i;
  }

  console.timeEnd("CPU Bound");
  return sum;
}
CPUBound();

async function IOBound() {
  console.time("IO Bound");

  const promises = [];
  for (let i = 1; i < 10; i++) {
    promises.push(fs.readFile(`src/tasks/event-loop/test-files/${i}.txt`, "utf-8"));
  }

  const contents = await Promise.all(promises)

  console.timeEnd("IO Bound");
}
IOBound();

// CPU bound блокирует event loop потому что эта большая операция которая 
// выполняется джаваскриптом и занимает стек выполнения, и другие задачи не могут выполнятся

// а IO bound не блокирует event loop, потому что он дал задание на чтение файлов и перешел на новую задачу, 
// и когда файлы все прочитаются то он закинет задачу в очередь макрозадач