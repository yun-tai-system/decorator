
import { createDecorator, createClassDecorator, createPropertyDecorator, createMethodDecorator, createParameterDecorator, getDecorator } from './index';
const DemoClass = createClassDecorator(`demo class`)
const DemoProperty = createPropertyDecorator(`demo property`)
const DemoMethod = createMethodDecorator(`demo method`)
const DemoParameter = createParameterDecorator(`demo parameter`)
const Demo2Class = createDecorator(`demo2 class`)

@Demo2Class()
@DemoClass()
export class UserDemo {
    @DemoProperty()
    username: string;
    @DemoMethod()
    add(a: number, @DemoParameter() b: number): number {
        return a + b;
    }
    constructor(@DemoParameter() a: number, b: number) { }
}
const clsDemo = getDecorator(UserDemo)

debugger;