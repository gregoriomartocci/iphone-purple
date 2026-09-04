// Saca cuadros repartidos a lo largo de un video.
//
// Hace falta porque la miniatura que da Quick Look es el primer cuadro, y en
// los videos que mandan los proveedores el primero es casi siempre una mano
// entrando en cuadro o una pantalla negra. El modelo del equipo recién se ve
// en el medio, cuando lo giran.
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else {
  FileHandle.standardError.write("uso: cuadros <video> <prefijo-salida>\n".data(using: .utf8)!)
  exit(1)
}

let asset = AVURLAsset(url: URL(fileURLWithPath: args[1]))
let generador = AVAssetImageGenerator(asset: asset)
generador.appliesPreferredTrackTransform = true
generador.maximumSize = CGSize(width: 720, height: 720)
generador.requestedTimeToleranceBefore = .zero
generador.requestedTimeToleranceAfter = .zero

let duracion = CMTimeGetSeconds(asset.duration)
for (i, parte) in [0.2, 0.4, 0.6, 0.8].enumerated() {
  let t = CMTime(seconds: duracion * parte, preferredTimescale: 600)
  guard let cg = try? generador.copyCGImage(at: t, actualTime: nil) else { continue }
  let rep = NSBitmapImageRep(cgImage: cg)
  guard let datos = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.8])
  else { continue }
  try? datos.write(to: URL(fileURLWithPath: "\(args[2])-\(i + 1).jpg"))
}
