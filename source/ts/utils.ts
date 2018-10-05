namespace monoloco.core {
    export class utils {
        public static degToRad(deg: number): number {
            return (deg * Math.PI / 180);
        }

        public static radToDeg(rad: number): number {
            return (rad * 180 / Math.PI);
        }
    }
}
