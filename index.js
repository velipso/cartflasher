import { SerialPort } from 'serialport';

const device = '/dev/cu.usbserial-2110';
const baudRate = 115200;

async function open(device, baudRate) {
  return new Promise((resolve, reject) => {
    console.log(`Opening: ${device} baud rate ${baudRate}`);
    const port = new SerialPort({ path: device, baudRate });
    const hexStr = (n) => n.map(n => `0${n.toString(16)}`.substr(-2)).join(', ');
    port.on('open', () => {
      console.log('Connected!');
      resolve({
        write: (data) => {
          console.log(`Writing: ${hexStr(data)}`);
          port.write(Buffer.from(data));
        },
        read: () => {
          console.log('Reading...');
          return new Promise((resolve, reject) => {
            port.once('data', (data) => {
              const ar = Array.from(data);
              console.log(`Response: ${hexStr(ar)}`);
              resolve(ar);
            });
          });
        },
        close: () => {
          port.close();
        }
      });
    });
  });
}

const port = await open(device, baudRate);
for (let i = 0x58; i < 256; i++) {
  port.write([i]);
  await port.read();
}
/*
port.write([0x56]); // -> 0xfe
await port.read();
port.write([0x68]); // -> 0xe0
await port.read();
port.write([0xa1]); // -> 0xe0
await port.read();
*/
port.close();

/*
00 -> 80
01 -> e0
02 -> 80
03 -> e0
04 -> 86
05 -> f8
06 -> 86
07 -> f8
08 -> 18
09 -> e0
0a -> 80
0b -> f8
0c -> 80
0d -> f8
0e -> 86
0f -> f8
10 -> 98
11 -> e6
12 -> 98
13 -> e0
14 -> 9e
15 -> fe
16 -> 9e
17 -> fe
18 -> 98
19 -> e6
1a -> 98
1b -> fe
1c -> 9e
1d -> fe
1e -> 9e
1f -> fe
20 -> 80
21 -> e0
22 -> 80
23 -> e6
24 -> 86
25 -> f8
26 -> 86
27 -> f8
28 -> 80
29 -> e0
2a -> 80
2b -> fe
2c -> 86
2d -> fe
2e -> 86
2f -> fe
30 -> 98
31 -> e6
32 -> 98
33 -> e6
34 -> 9e
35 -> fe
36 -> 9e
37 -> fe
38 -> 98
39 -> e6
3a -> 98
3b -> fe
3c -> 9e
3d -> fe
3e -> 9e
3f -> fe
40 -> e0
41 -> f8
42 -> e0
43 -> 06
44 -> e6
45 -> fe
46 -> e6
47 -> e6
48 -> e0
49 -> f8
4a -> e0
4b -> f8
4c -> e6
4d -> f8
4e -> e6
4f -> f8
50 -> f8
51 -> fe
52 -> f8
53 -> e0
54 -> fe
55 -> hangs
56 -> fe
57 -> hangs
58 -> f8
59 -> fe
5a -> f8
5b -> hangs
*/
