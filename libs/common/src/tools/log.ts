import { LogLevelType } from "../enums";

const USING_LOG_LEVEL = process.env.ENV == "development" ? LogLevelType.Debug : LogLevelType.Error;

/**
 * A by LJ 2023-9-18 18:56:15
 * 和 LogService 有雷同
 */
export default class Log {
  static debug(...args: any[]) {
    if (USING_LOG_LEVEL > LogLevelType.Debug) {
      return;
    }
    // const callerFunc = arguments.callee.caller.toString();
    // let callerFuncName = (callerFunc.substring(callerFunc.indexOf("function") + 8, callerFunc.indexOf("(")) || "anoynmous")
    // callerFuncName = "[DEBUG] " + callerFuncName;
    const e = new Error();
    const stack = e.stack.toString().split(/\r\n|\n/);
    //Error
    //    at Log.debug
    //    at ./src/main.ts (https://localhost:8080/app/main.5e532625fddd09bc1b63.js:56046:69)
    //这里的行号是应该是编译后的代码行号, 怎么拿源码的行号??
    const callerLine = stack[2];
    const matchArray = callerLine.match(/at (.+?) ((.+?))/);
    const simpleLoc = matchArray[1];
    // this.doLog([stack, ...args]);
    this.doLog([simpleLoc, ...args]);
  }

  static info(...args: any[]) {
    if (USING_LOG_LEVEL > LogLevelType.Info) {
      return;
    }
    this.doLog(args);
  }

  private static doLog(args: any[]) {
    const pargs: any[] = [];
    args.map((e) => {
      if (e instanceof Function) {
        const vessel: any[] = []; // 为方便单行lambda使用时塞入内容, 而不用指定返回值
        let r = e(vessel);
        r = r === undefined && vessel.length > 0 ? vessel : r;
        pargs.push(r);
      } else {
        pargs.push(e);
      }
    });
    // eslint-disable-next-line no-console
    console.log(pargs);
  }
}
