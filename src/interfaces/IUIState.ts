import type { IBox, ICoordinates } from '.';

export default interface IUIState {
    isControlCenterCollapsed: boolean;
    isViewingEvent: boolean;
    isEventListVisible: boolean;
    currentClickCoords: ICoordinates;
    currentWindowDimensions: IBox;
}
