
import {
  call,
  send_message,
  report,
} from './process.js';


async function main() {
  console.log("Wellcome to program ");

  // each function should run seperatly and in order.
  await call();     //create pda address
  await send_message();     //make instruction and send to the cluster
  await report();     //read from pda
  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
