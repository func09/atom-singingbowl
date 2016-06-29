'use babel';

import { CompositeDisposable } from 'atom';
import Tone from 'tone'

const MAX_SINEWAVES = 3
const BASE_FREQUENCY = 440
const MIN_FREQUENCY = BASE_FREQUENCY - 10
const MAX_FREQUENCY = BASE_FREQUENCY + 10

class SingingBowl {
  constructor(){
    const freeverb = new Tone.Freeverb();
    const comp = new Tone.Compressor(-30, 3).chain(freeverb).connect(Tone.Master)

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
      sinewave.frequency.rampTo(BASE_FREQUENCY, 20)
      sinewave.volume.cancelScheduledValues()
      sinewave.volume.value = 1
      sinewave.volume.rampTo(-Infinity, 30)
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
