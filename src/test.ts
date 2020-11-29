
import { createDecorator, createClassDecorator, createPropertyDecorator, createMethodDecorator, createParameterDecorator, getDecorator } from './index';
export interface DemoClass {
    new(): DemoClass;
    (): ClassDecorator;
}
const DemoClass = createClassDecorator<DemoClass>(`demo class`)
export interface DemoProperty {
    new(): DemoProperty;
    (): PropertyDecorator;
}
const DemoProperty = createPropertyDecorator<DemoProperty>(`demo property`)
export interface DemoMethod {
    new(): DemoMethod;
    (): MethodDecorator;
}
const DemoMethod = createMethodDecorator<DemoMethod>(`demo method`)
export interface DemoParameter {
    new(): DemoParameter;
    (): ParameterDecorator;
}
const DemoParameter = createParameterDecorator<DemoParameter>(`demo parameter`)
export interface Demo2Class {
    new(): Demo2Class;
    (): ClassDecorator;
}
const Demo2Class = createDecorator<Demo2Class>(`demo2 class`)

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