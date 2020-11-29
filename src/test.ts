
import { createDecorator, getDecorator } from './index';
const DemoClass = createDecorator(`demo class`)
const DemoProperty = createDecorator(`demo property`)
const DemoMethod = createDecorator(`demo method`)
const DemoParameter = createDecorator(`demo parameter`)

@DemoClass()
export class UserDemo {

    @DemoProperty()
    username: string;

    @DemoMethod()
    add(@DemoParameter() a: number, @DemoParameter() b: number): number {
        return a + b;
    }

    constructor(@DemoParameter() a: number, @DemoParameter() b: number) { }
}

const clsDemo = getDecorator(UserDemo)

debugger;