'use babel';

import { CompositeDisposable } from 'atom';
import Tone from 'tone'

const MAX_SINEWAVES = 3
const BASE_FREQUENCY = 220
const MIN_FREQUENCY = BASE_FREQUENCY - 25
const MAX_FREQUENCY = BASE_FREQUENCY + 25
const RESONANCE_DURATION = 20
const MUTE_DURATION = 30

class SingingBowl {
  constructor(){
    const panner = new Tone.AutoPanner("4n")
    const freeverb = new Tone.Freeverb();
    const comp = new Tone.Compressor(-30, 3).chain(panner, freeverb).connect(Tone.Master)

    this.subscriptions = new CompositeDisposable()
    this.sinewaves = [...Array(MAX_SINEWAVES).keys()].map(n => {
      return new Tone.Oscillator(BASE_FREQUENCY, "sine").connect(comp)
    })
  }

  onChangeListener(){
    const randomFrequency = new Tone.CtrlRandom({
      min: MIN_FREQUENCY,
      max: MAX_FREQUENCY,
      integer: false,
    })
    this.sinewaves.forEach((sinewave)=>{
      sinewave.frequency.cancelScheduledValues()
      sinewave.frequency.value = randomFrequency.value
      sinewave.frequency.rampTo(BASE_FREQUENCY, RESONANCE_DURATION)
      sinewave.volume.cancelScheduledValues()
      sinewave.volume.value = 0
      sinewave.volume.rampTo(-Infinity, MUTE_DURATION)
      sinewave.start()
    })
  }

  activate(state){
    atom.workspace.observeTextEditors(editor => {
      this.subscriptions.add(editor.getBuffer().onDidChange(this.onChangeListener.bind(this)))
    })
  }

  deactivate(state){
    this.subscriptions.dispose()
  }
}

export default new SingingBowl()
