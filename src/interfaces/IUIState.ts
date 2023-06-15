import type { ICoordinates } from '.';

export default interface IUIState {
    isControlCenterCollapsed: boolean;
    isViewingEvent: boolean;
    isViewingEventList: boolean;
    currentClickCoords: ICoordinates;
}
