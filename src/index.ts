import "reflect-metadata";
import * as meepo from './types';
const decoratorKey = Symbol.for(`decorator`)
export const getDesignType = (target: any, propertyKey: PropertyKey) =>
    Reflect.getMetadata('design:type', target, propertyKey as any);
export const getDesignParamTypes = (target: any, propertyKey?: PropertyKey) =>
    Reflect.getMetadata('design:paramtypes', target, propertyKey as any);
export const getDesignTargetParams = (target: any) =>
    Reflect.getMetadata('design:paramtypes', target);
export const getDesignReturnType = (target: any, propertyKey: PropertyKey) =>
    Reflect.getMetadata('design:returntype', target, propertyKey as any);

export function createClassDecorator<O>(metadataKey: string) {
    return (options?: O): ClassDecorator => {
        return (target: any) => {
            const decorator = meepo.DecoratorStore.get(target);
            decorator.classes.push(
                new meepo.ClassDecorator(metadataKey, options)
            );
            Reflect.set(target, decoratorKey, decorator.toJson())
        }
    }
}
export function createPropertyDecorator<O>(metadataKey: string) {
    return (options?: O): PropertyDecorator => {
        return (target: any, property: any) => {
            const type = target.constructor;
            const decorator = meepo.DecoratorStore.get(type);
            const types = getDesignType(target, property);
            decorator.properties.add(property, new meepo.PropertyDecorator(metadataKey, options, types))
            Reflect.set(type, decoratorKey, decorator.toJson())
        }
    }
}
export function createParameterDecorator<O>(metadataKey: string) {
    return (options?: O): ParameterDecorator => {
        return (target: any, property: any, index: number) => {
            let type = target;
            const key = property || 'constructor';
            let types: any[] = [];
            if (property) {
                type = target.constructor;
                types = getDesignParamTypes(target, property);
            } else {
                types = getDesignTargetParams(target)
            }
            const decorator = meepo.DecoratorStore.get(type);
            const constructorDecorator = decorator.parameters.get(key)
            constructorDecorator.add(`${index}`, new meepo.ParameterDecorator(metadataKey, options, types[index]));
            Reflect.set(type, decoratorKey, decorator.toJson())
        }
    }
}
export function createMethodDecorator<O>(metadataKey: string) {
    return (options?: O): MethodDecorator => {
        return (target: any, property: any, descriptor: TypedPropertyDescriptor<any>) => {
            const type = target.constructor;
            const decorator = meepo.DecoratorStore.get(type);
            const types = getDesignReturnType(target, property);
            decorator.methods.add(property, new meepo.MethodDecorator(metadataKey, options, descriptor, types));
            Reflect.set(type, decoratorKey, decorator.toJson())
        }
    }

}
export function createDecorator<O>(metadataKey: string) {
    return (options?: O) => {
        return (target: any, property?: any, index?: any) => {
            if (property) {
                // method or property
                if (typeof index === 'number') {
                    // params
                    return createParameterDecorator(metadataKey)(options)(target, property, index)
                }
                else if (index) {
                    return createMethodDecorator(metadataKey)(options)(target, property, index)
                }
                return createPropertyDecorator(metadataKey)(options)(target, property)
            }
            if (typeof index === 'number') {
                // constructor
                return createParameterDecorator(metadataKey)(options)(target, property, index)
            }
            return createClassDecorator(metadataKey)(options)(target);
        }
    }
}
export interface IClassDecorator<O = any> {
    kind: 'ClassDecorator', name: string, options: O
}
export interface IMethodDecorator<O = any> {
    kind: 'MethodDecorator', name: string, options: O, type: any
}
export interface IPropertyDecorator<O = any> {
    kind: 'PropertyDecorator', name: string, options: O, type: any
}
export interface IParameterDecorator<O = any> {
    kind: 'ParameterDecorator', name: string, options: O, type: any
}
export function getDecorator(type: meepo.Type<any>): {
    classes: IClassDecorator[],
    methods: { [key: string]: IMethodDecorator[] },
    properties: { [key: string]: IPropertyDecorator[] },
    parameters: { [key: string]: IParameterDecorator[] }
} {
    return Reflect.get(type, decoratorKey) || {
        classes: [],
        methods: [],
        properties: [],
        parameters: []
    }
}
