import nodejs from 'nodejs-mobile-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AdvancedPromise, createAdvancedPromise } from './createAdvancedPromise';

export class NodeJSCommunication {
  private static _instance: NodeJSCommunication;
  private socketDataInRoomPromises = new Map<string, AdvancedPromise<SocketData[]>>();
  private proofDataToRoomPromises = new Map<string, AdvancedPromise<boolean>>();

  private constructor() {
    nodejs.channel.addListener('message', this.onMessage);
    nodejs.channel.addListener('socketDataInRoom', this.onSocketDataInRoom);
    nodejs.channel.addListener('proofDataToRoom', this.onProofDataToRoom);
    console.log('nodejs.start');
    nodejs.start('main.js');
    nodejs.channel.post('message', 'SAMPLE LOG FROM RN MOBILE TO NODEJS WORKER');
    console.log('nodejs.channel.post');
    setTimeout(() => {
      // TODO WE CAN IMPROVE IT IN THE FUTURE TO OPEN SERVER ONLY WHEN NEEDED MAYBE?
      nodejs.channel.post('startLifecycle');
      // nodejs.channel.addListener('startLifecycle', (started) => {});
      // nodejs.channel.post('stopLifecycle');
      // nodejs.channel.addListener('stopLifecycle', (stopped) => {});
    }, 100);
  }

  private onMessage = (...args: any[]) => {
    console.log('LOG FROM NODEJS: ', ...args);
  }

  private onSocketDataInRoom = (room: string, data: SocketData[]) => {
    const promise = this.socketDataInRoomPromises.get(room);
    if (promise) {
      promise.resolve(data);
      this.socketDataInRoomPromises.delete(room);
    }
  }

  public requestSocketDataInRoom = (room: string): Promise<SocketData[]> => {
    nodejs.channel.post(`socketDataInRoom`, room);
    let promise = this.socketDataInRoomPromises.get(room);
    if (promise) return promise;
    promise = createAdvancedPromise<SocketData[]>(15000);
    this.socketDataInRoomPromises.set(room, promise);
    return promise;
  }

  private onProofDataToRoom = (uuid: string, result: boolean) => {
    const promise = this.proofDataToRoomPromises.get(uuid);
    if (promise) {
      promise.resolve(result);
      this.proofDataToRoomPromises.delete(uuid);
    } else {
      console.log(`received proof acknowledge for non-existent UUID: ${uuid}`);
    }
  }

  public sendProofDataToRoom = (room: string, proofBuffer: Uint8Array): Promise<boolean> => {
    const uuid = uuidv4();
    const proofHex = Array.from(proofBuffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
    let promise = this.proofDataToRoomPromises.get(uuid);
    if (promise) return Promise.reject(new Error('UUID not unique??'));
    promise = createAdvancedPromise<boolean>(60000);
    this.proofDataToRoomPromises.set(uuid, promise);
    nodejs.channel.post(`sendProofDataToRoom`, uuid, room, proofHex);
    return promise;
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new NodeJSCommunication();
    }
    return this._instance;
  }
}

type SocketData = {
  type: 'SDK',
  id: string,
  detail: {
    clientOrigin: string,
    clientName: string,
  }
}

export const useNodeJSCommunication = () => {
  return NodeJSCommunication.getInstance();
}
export const useSocketDataInRoom = (room: string) => {
  const [socketDataInRoom, setSocketDataInRoom] = useState<SocketData[]>([]);
  const roomRef = useRef(room);
  roomRef.current = room;
  const nodeJSCommunication = useNodeJSCommunication();
  
  useEffect(() => {
    let timeout: any;
    const reloadSocketDataInRoom = () => {
      nodeJSCommunication.requestSocketDataInRoom(room)
        .then(data => {
          if (roomRef.current === room) {
            setSocketDataInRoom(data);
            timeout = setTimeout(reloadSocketDataInRoom, 1000, room, data);
          }
        })
    }
    timeout = setTimeout(reloadSocketDataInRoom, 1000);

    return () => {
      clearTimeout(timeout);
    }
  }, [room]);
  
  return socketDataInRoom;
}