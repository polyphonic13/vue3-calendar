import type { ICoordinates } from '.';

export default interface IUIState {
    isControlCenterCollapsed: boolean;
    isViewingEvent: boolean;
    isEventListVisible: boolean;
    currentClickCoords: ICoordinates;
}
